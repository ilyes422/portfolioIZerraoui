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


class FootballService:
    def __init__(self, settings: Settings, redis: Redis):
        self.settings = settings
        self.redis = redis
        self.last: MatchDay | None = None
        self.retry_at: datetime | None = None
        self.lock = asyncio.Lock()

    async def today(self, client: httpx.AsyncClient, now: datetime | None = None) -> MatchDay:
        now = now or datetime.now(UTC)
        day = now.astimezone(PARIS).date()
        if not self.settings.football_data_token:
            return MatchDay(day=day, state="unconfigured")
        async with self.lock:
            return await self._load(client, day, now)

    async def _load(self, client: httpx.AsyncClient, day: date, now: datetime) -> MatchDay:
        key = f"portfolio:football:v1:{day.isoformat()}"
        last = self.last if self.last and self.last.day == day else None
        if self.redis.enabled:
            try:
                cached = await self.redis.command(client, "GET", key)
                if cached:
                    last = MatchDay.model_validate_json(cached)
            except (httpx.HTTPError, ValueError):
                pass
        age = (now - last.updated_at).total_seconds() if last and last.updated_at else float("inf")
        if last and age < 300:
            return last
        if self.retry_at and now < self.retry_at:
            return self._fallback(day, last, age)

        start, end = paris_window(day)
        try:
            response = await client.get(
                "https://api.football-data.org/v4/matches",
                headers={"X-Auth-Token": self.settings.football_data_token.get_secret_value()},
                params={
                    "dateFrom": start.date().isoformat(),
                    "dateTo": (end.date() + timedelta(days=1)).isoformat(),
                    "competitions": ",".join(sorted(COMPETITIONS)),
                },
                timeout=6,
            )
            response.raise_for_status()
            result = MatchDay(day=day, state="ready", updated_at=now, matches=normalize_matches(response.json(), day))
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

    @staticmethod
    def _fallback(day: date, last: MatchDay | None, age: float) -> MatchDay:
        if last and age <= 43200:
            return last.model_copy(update={"state": "stale"})
        return MatchDay(day=day, state="unavailable")
