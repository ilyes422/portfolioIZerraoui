"""Vérifie les frontières sport, recherche et fournisseur de génération."""

import asyncio
import re
from datetime import UTC, date, datetime, timedelta

import httpx
from fastapi.testclient import TestClient

from app.assistant import Question, answer_question
from app.config import Settings
from app.football import FootballService, normalize_matches, paris_window
from app.main import create_app
from app.services import GenerationBudget, Redis


def test_match_window_handles_daylight_saving():
    start, end = paris_window(date(2026, 10, 25))
    assert end - start == timedelta(hours=25)


def match_fixture(kickoff: str, id: int = 42):
    return {
        "id": id, "utcDate": kickoff, "status": "FINISHED",
        "competition": {"name": "Ligue 1", "code": "FL1"},
        "homeTeam": {"name": "Équipe A"}, "awayTeam": {"name": "Équipe B"},
        "score": {"fullTime": {"home": 0, "away": 1}},
    }


def test_utc_boundary_filters_to_paris_day_and_keeps_zero_scores():
    values = normalize_matches({"matches": [
        match_fixture("2026-11-05T22:59:00Z", 41),
        match_fixture("2026-11-05T23:00:00Z"),
        match_fixture("2026-11-06T23:00:00Z", 43),
    ]}, date(2026, 11, 6))
    assert [item.id for item in values] == [42]
    assert values[0].home_score == 0
    assert values[0].status == "Terminé"


def test_football_cache_and_stale_on_rate_limit():
    settings = Settings(_env_file=None, app_env="test", football_data_token="fixture-token")
    service = FootballService(settings, Redis(settings))
    now = datetime(2026, 11, 6, 12, tzinfo=UTC)
    calls = []

    def provider(request: httpx.Request):
        calls.append(request)
        assert request.headers["X-Auth-Token"] == "fixture-token"
        assert request.url.params["dateTo"] == "2026-11-07"
        if len(calls) > 1:
            return httpx.Response(429, json={"message": "quota"})
        return httpx.Response(200, json={"matches": [match_fixture("2026-11-06T10:00:00Z")]})

    async def exercise():
        async with httpx.AsyncClient(transport=httpx.MockTransport(provider)) as client:
            first = await service.today(client, now)
            cached = await service.today(client, now + timedelta(seconds=30))
            stale = await service.today(client, now + timedelta(seconds=301))
        assert first.state == cached.state == "ready"
        assert stale.state == "stale" and stale.matches == first.matches
        assert len(calls) == 2

    asyncio.run(exercise())


def test_no_sports_key_uses_open_liga_with_verified_day_and_scores():
    settings = Settings(_env_file=None, app_env="test")
    service = FootballService(settings, Redis(settings))
    now = datetime(2026, 11, 6, 12, tzinfo=UTC)
    calls = []
    fixture = {
        "matchID": 123,
        "matchDateTimeUTC": "2026-11-05T23:00:00Z",
        "matchIsFinished": True,
        "team1": {"teamName": "Équipe A"},
        "team2": {"teamName": "Équipe B"},
        "matchResults": [
            {"resultTypeID": 1, "pointsTeam1": 0, "pointsTeam2": 0},
            {"resultTypeID": 2, "pointsTeam1": 0, "pointsTeam2": 2},
            {"resultTypeID": 5, "pointsTeam1": 4, "pointsTeam2": 5},
        ],
    }

    def provider(request: httpx.Request):
        calls.append(request.url.path)
        assert request.url.host == "api.openligadb.de"
        assert request.url.path.endswith("/2026")
        assert "X-Auth-Token" not in request.headers
        if "/pl/" in request.url.path:
            return httpx.Response(200, json=[
                fixture,
                {**fixture, "matchID": 124, "matchDateTimeUTC": "2026-11-06T23:00:00Z"},
                {**fixture, "matchID": 125, "matchIsFinished": False},
            ])
        if "/ucl/" in request.url.path:
            return httpx.Response(200, json=[
                {**fixture, "matchDateTimeUTC": "2026-11-04T20:00:00Z"},
            ])
        return httpx.Response(503)

    async def exercise():
        async with httpx.AsyncClient(transport=httpx.MockTransport(provider)) as client:
            first = await service.today(client, now)
            cached = await service.today(client, now + timedelta(minutes=10))
        assert first == cached
        assert first.state == "ready" and first.provider == "openligadb"
        assert first.competitions == ["PL", "CL"]
        assert [match.id for match in first.matches] == [123, 125]
        finished, unconfirmed = first.matches
        assert (finished.home_score, finished.away_score, finished.status) == (0, 2, "Terminé")
        assert unconfirmed.home_score is None and unconfirmed.status == "Résultat à confirmer"
        assert len(calls) == 4

    asyncio.run(exercise())


def test_open_liga_provider_failure_is_not_an_empty_match_day():
    settings = Settings(_env_file=None, app_env="test")
    service = FootballService(settings, Redis(settings))

    async def exercise():
        transport = httpx.MockTransport(lambda request: httpx.Response(503))
        async with httpx.AsyncClient(transport=transport) as client:
            result = await service.today(client)
        assert result.state == "unavailable" and result.provider == "openligadb"
        assert not result.competitions and not result.matches

    asyncio.run(exercise())


def test_assistant_returns_real_source_and_refuses_unknown_topic():
    settings = Settings(_env_file=None, app_env="test")
    with TestClient(create_app(settings)) as client:
        response = client.post("/api/assistant", json={"question": "Quelles missions chez XEFI ?"})
        assert response.status_code == 200
        assert response.json()["mode"] == "sources"
        assert "CakePHP" in response.json()["text"]
        assert "/parcours" in [item["href"] for item in response.json()["sources"]]
        unknown = client.post("/api/assistant", json={"question": "Calculer la constante cosmologique"})
        assert unknown.json()["mode"] == "unknown"
        assert unknown.json()["sources"] == []
        assert client.post("/api/assistant", json={"question": " "}).status_code == 422


def test_assistant_links_to_the_original_pdf_for_a_cv_question():
    settings = Settings(_env_file=None, app_env="test")
    with TestClient(create_app(settings)) as client:
        response = client.post("/api/assistant", json={"question": "Montre-moi ton CV"})
    assert response.status_code == 200
    links = {source["href"] for source in response.json()["sources"]}
    assert {"/cv", "/documents/cv-ilyes-zerraoui.pdf"} <= links


def test_generation_passes_only_approved_context_and_keeps_server_links():
    settings = Settings(_env_file=None, app_env="test", llm_api_key="fixture-key")
    budget = GenerationBudget(settings, Redis(settings))

    def provider(request: httpx.Request):
        assert request.url.path.endswith("/chat/completions")
        assert "CakePHP" in request.content.decode()
        assert not re.search(r"\b\d+\s+(?:rue|avenue|boulevard)\b", request.content.decode(), re.I)
        return httpx.Response(200, json={"choices": [{"message": {"content": "Chez XEFI, Ilyes a travaillé sur des applications métier avec CakePHP et Laravel."}}]})

    async def exercise():
        async with httpx.AsyncClient(transport=httpx.MockTransport(provider)) as client:
            result = await answer_question(client, settings, budget, Question(question="Quelles missions chez XEFI ?"))
        assert result.mode == "generative"
        assert result.sources and all(source.href.startswith("/") for source in result.sources)

    asyncio.run(exercise())


def test_production_without_shared_budget_does_not_call_model():
    settings = Settings(
        _env_file=None, app_env="production", cors_origins=["https://portfolio.example"],
        llm_api_key="fixture-key",
    )
    with TestClient(create_app(settings)) as client:
        answer = client.post("/api/assistant", json={"question": "Quel est ton CV ?"})
        assert answer.json()["mode"] == "sources"
