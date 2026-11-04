"""Configuration serveur validée au démarrage."""

from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "test", "production"] = "development"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    @field_validator("cors_origins")
    @classmethod
    def validate_origins(cls, origins: list[str]) -> list[str]:
        if not origins:
            raise ValueError("Configure au moins une origine autorisée.")
        for origin in origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or "*" in origin
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError("Chaque origine doit être une URL HTTP(S) exacte sans chemin.")
            # Reading .port also rejects invalid ports such as :99999.
            _ = parsed.port
        return list(dict.fromkeys(origins))

    @model_validator(mode="after")
    def validate_production_origins(self) -> "Settings":
        if self.app_env == "production":
            for origin in self.cors_origins:
                parsed = urlsplit(origin)
                if parsed.scheme != "https" or parsed.hostname in {"localhost", "127.0.0.1", "::1"}:
                    raise ValueError("En production, configure les origines HTTPS publiques du portfolio.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
