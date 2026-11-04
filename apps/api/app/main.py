"""Point d'entrée ASGI, compatible avec Uvicorn et Vercel."""

from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import Settings, get_settings


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: Literal["portfolio-api"] = "portfolio-api"
    version: str = "0.1.0"


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings if settings is not None else get_settings()
    development_docs = config.app_env != "production"
    application = FastAPI(
        title="Portfolio Ilyes Zerraoui — API",
        version="0.1.0",
        docs_url="/docs" if development_docs else None,
        redoc_url=None,
        openapi_url="/openapi.json" if development_docs else None,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Content-Type"],
        max_age=600,
    )

    @application.get("/api/health", response_model=HealthResponse, tags=["health"])
    def health() -> HealthResponse:
        """Liveness du processus ; ne vérifie pas les futurs fournisseurs externes."""
        return HealthResponse()

    return application


app = create_app()
