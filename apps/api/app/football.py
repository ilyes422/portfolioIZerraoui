"""Lecture, normalisation et cache des matchs du jour à Paris."""

import asyncio
from datetime import UTC, date, datetime, time, timedelta
from typing import Literal
from zoneinfo import ZoneInfo

import httpx
from pydantic import BaseModel, Field

from app.config import Settings
from app.services import Redis

PARIS = ZoneInfo("Europe/Paris")
COMPETITIONS = {"FL1", "PL", "PD", "BL1", "SA", "CL"}
OPEN_LIGA_COMPETITIONS = {
    "PL": ("pl", "Premier League"),
    "PD": ("la1", "Liga"),
    "BL1": ("bl1", "Bundesliga"),
    "CL": ("ucl", "Ligue des champions"),
}
Provider = Literal["football-data.org", "openligadb"]
STATUS = {
    "SCHEDULED": "À venir", "TIMED": "À venir", "IN_PLAY": "En cours", "PAUSED": "Mi-temps",
    "FINISHED": "Terminé", "POSTPONED": "Reporté", "CANCELLED": "Annulé",
    "SUSPENDED": "Suspendu", "AWARDED": "Attribué",
}


class Match(BaseModel):
    id: int
    kickoff: datetime
    competition: str
    code: str
    home: str
    away: str
    home_score: int | None = None
    away_score: int | None = None
    status: str


class MatchDay(BaseModel):
    day: date
    state: Literal["ready", "stale", "unconfigured", "unavailable"]
    provider: Provider = "football-data.org"
    competitions: list[str] = Field(default_factory=lambda: sorted(COMPETITIONS))
    updated_at: datetime | None = None
    matches: list[Match] = Field(default_factory=list)


def paris_window(day: date) -> tuple[datetime, datetime]:
    start = datetime.combine(day, time.min, PARIS).astimezone(UTC)
    end = datetime.combine(day + timedelta(days=1), time.min, PARIS).astimezone(UTC)
    return start, end


def normalize_matches(payload: dict, day: date) -> list[Match]:
    start, end = paris_window(day)
    values = payload.get("matches")
    if not isinstance(values, list):
        raise ValueError("Réponse football invalide.")
    matches = []
    for value in values:
        try:
            kickoff = datetime.fromisoformat(value["utcDate"])
            league = value["competition"]
            if kickoff.tzinfo is None or not start <= kickoff < end or league["code"] not in COMPETITIONS:
                continue
            goals = (value.get("score") or {}).get("fullTime") or {}
            matches.append(Match(
                id=value["id"], kickoff=kickoff, competition=league["name"], code=league["code"],
                home=value["homeTeam"].get("shortName") or value["homeTeam"]["name"],
                away=value["awayTeam"].get("shortName") or value["awayTeam"]["name"],
                home_score=goals.get("home"), away_score=goals.get("away"),
                status=STATUS.get(value.get("status"), "Statut indisponible"),
            ))
        except (KeyError, TypeError, ValueError, AttributeError):
            continue
    if values and not matches and not all(isinstance(value, dict) and "utcDate" in value for value in values):
        raise ValueError("Format des matchs inattendu.")
    return sorted(matches, key=lambda match: match.kickoff)


def normalize_open_liga(
    values: list, code: str, day: date, now: datetime,
) -> list[Match]:
    start, end = paris_window(day)
    matches = []
    for value in values:
        try:
            kickoff = datetime.fromisoformat(value["matchDateTimeUTC"])
            if kickoff.tzinfo is None or not start <= kickoff < end:
                continue
            finished = value.get("matchIsFinished") is True
            status = "À venir" if kickoff > now else "Résultat à confirmer"
            goals = {}
            if finished:
                status = "Terminé"
                # Exclude the half-time and shootout scores from the match total.
                goals = max(
                    (
                        result for result in value.get("matchResults") or []
                        if result.get("resultTypeID") in (2, 4)
                    ),
                    key=lambda result: result["resultTypeID"],
                    default={},
                )
            matches.append(Match(
                id=value["matchID"], kickoff=kickoff, competition=OPEN_LIGA_COMPETITIONS[code][1],
                code=code, home=value["team1"]["teamName"], away=value["team2"]["teamName"],
                home_score=goals.get("pointsTeam1"), away_score=goals.get("pointsTeam2"),
                status=status,
            ))
        except (KeyError, TypeError, ValueError, AttributeError):
            continue
    return matches


class FootballService:
    def __init__(self, settings: Settings, redis: Redis):
        self.settings = settings
        self.redis = redis
        self.provider: Provider = "football-data.org" if settings.football_data_token else "openligadb"
        self.last: MatchDay | None = None
        self.retry_at: datetime | None = None
        self.lock = asyncio.Lock()

    async def today(self, client: httpx.AsyncClient, now: datetime | None = None) -> MatchDay:
        now = now or datetime.now(UTC)
        day = now.astimezone(PARIS).date()
        async with self.lock:
            return await self._load(client, day, now)

    async def _load(self, client: httpx.AsyncClient, day: date, now: datetime) -> MatchDay:
        key = f"portfolio:football:v2:{self.provider}:{day.isoformat()}"
        last = self.last if self.last and self.last.day == day else None
        if self.redis.enabled:
            try:
                cached = await self.redis.command(client, "GET", key)
                if cached:
                    last = MatchDay.model_validate_json(cached)
            except (httpx.HTTPError, ValueError):
                pass
        age = (now - last.updated_at).total_seconds() if last and last.updated_at else float("inf")
        max_age = 900 if self.provider == "openligadb" else 300
        if last and age < max_age:
            return last
        if self.retry_at and now < self.retry_at:
            return self._fallback(day, last, age)

        try:
            if self.provider == "openligadb":
                matches, competitions = await self._open_liga_matches(client, day, now)
            else:
                matches, competitions = await self._football_data_matches(client, day)
            result = MatchDay(
                day=day, state="ready", provider=self.provider, competitions=competitions,
                updated_at=now, matches=matches,
            )
        except (httpx.HTTPError, ValueError, AttributeError):
            self.retry_at = now + timedelta(seconds=90)
            return self._fallback(day, last, age)
        self.last = result
        self.retry_at = None
        if self.redis.enabled:
            try:
                await self.redis.command(client, "SET", key, result.model_dump_json(), "EX", 43200)
            except (httpx.HTTPError, ValueError):
                pass
        return result

    async def _football_data_matches(
        self, client: httpx.AsyncClient, day: date,
    ) -> tuple[list[Match], list[str]]:
        token = self.settings.football_data_token
        assert token is not None
        start, end = paris_window(day)
        competitions = sorted(COMPETITIONS)
        response = await client.get(
            "https://api.football-data.org/v4/matches",
            headers={"X-Auth-Token": token.get_secret_value()},
            params={
                "dateFrom": start.date().isoformat(),
                "dateTo": (end.date() + timedelta(days=1)).isoformat(),
                "competitions": ",".join(competitions),
            },
            timeout=6,
        )
        response.raise_for_status()
        return normalize_matches(response.json(), day), competitions

    async def _open_liga_matches(
        self, client: httpx.AsyncClient, day: date, now: datetime,
    ) -> tuple[list[Match], list[str]]:
        season = day.year if day.month >= 7 else day.year - 1

        async def read_league(code: str, shortcut: str) -> list[Match] | None:
            try:
                response = await client.get(
                    f"https://api.openligadb.de/getmatchdata/{shortcut}/{season}", timeout=6,
                )
                response.raise_for_status()
                values = response.json()
                if not isinstance(values, list) or not any(
                    isinstance(value, dict) and "matchDateTimeUTC" in value for value in values
                ):
                    return None
                return normalize_open_liga(values, code, day, now)
            except (httpx.HTTPError, ValueError):
                return None

        results = await asyncio.gather(*(
            read_league(code, shortcut)
            for code, (shortcut, _) in OPEN_LIGA_COMPETITIONS.items()
        ))
        available = []
        matches = []
        for code, result in zip(OPEN_LIGA_COMPETITIONS, results, strict=True):
            if result is not None:
                available.append(code)
                matches.extend(result)
        if not available:
            raise ValueError("Aucune compétition OpenLigaDB disponible.")
        return sorted(matches, key=lambda match: match.kickoff), available

    def _fallback(self, day: date, last: MatchDay | None, age: float) -> MatchDay:
        if last and age <= 43200:
            return last.model_copy(update={"state": "stale"})
        return MatchDay(day=day, state="unavailable", provider=self.provider, competitions=[])
