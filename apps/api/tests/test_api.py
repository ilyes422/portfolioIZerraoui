"""Contrat HTTP et configuration des accès navigateur."""

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import Settings
from app.main import create_app


@pytest.fixture
def client():
    settings = Settings(_env_file=None, app_env="test", cors_origins=["http://localhost:3000"])
    with TestClient(create_app(settings)) as test_client:
        yield test_client


def test_health_contract(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "portfolio-api", "version": "0.1.0"}


def test_trusted_browser_origin(client):
    response = client.get("/api/health", headers={"Origin": "http://localhost:3000"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-credentials" not in response.headers


def test_untrusted_browser_origin_is_not_authorized(client):
    response = client.get("/api/health", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in response.headers


def test_preflight_rejects_untrusted_origin(client):
    response = client.options(
        "/api/health",
        headers={"Origin": "https://untrusted.example", "Access-Control-Request-Method": "GET"},
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


@pytest.mark.parametrize("origin", ["*", "https://*.example.com", "https://example.com/path", "file:///tmp"])
def test_origins_must_be_explicit(origin):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, cors_origins=[origin])


def test_production_requires_public_https_origin():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, app_env="production", cors_origins=["http://localhost:3000"])


def test_production_disables_api_documentation():
    settings = Settings(_env_file=None, app_env="production", cors_origins=["https://portfolio.example"])
    with TestClient(create_app(settings)) as client:
        assert client.get("/api/health").status_code == 200
        assert client.get("/docs").status_code == 404
        assert client.get("/openapi.json").status_code == 404
