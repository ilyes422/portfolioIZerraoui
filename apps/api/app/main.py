"""Point d'entrée ASGI, compatible avec Uvicorn et Vercel."""

from typing import Literal

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.assistant import Answer, Question, answer_question
from app.football import FootballService, MatchDay
from app.services import GenerationBudget, Redis


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
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
        max_age=600,
    )

    @application.get("/api/health", response_model=HealthResponse, tags=["health"])
    def health() -> HealthResponse:
        """Liveness du processus ; ne vérifie pas les futurs fournisseurs externes."""
        return HealthResponse()

    redis = Redis(config)
    football = FootballService(config, redis)
    budget = GenerationBudget(config, redis)

    @application.get("/api/matches", response_model=MatchDay, tags=["football"])
    async def matches(response: Response) -> MatchDay:
        async with httpx.AsyncClient() as client:
            day = await football.today(client)
        response.headers["Cache-Control"] = (
            "public, max-age=30, s-maxage=120" if day.state == "ready" else "no-store"
        )
        return day

    @application.middleware("http")
    async def limit_question_size(request: Request, call_next):
        if request.url.path == "/api/assistant" and request.method == "POST":
            size = request.headers.get("content-length", "0")
            if not size.isdecimal() or int(size) > 16_384:
                return JSONResponse({"detail": "Question trop volumineuse."}, status_code=413)
        return await call_next(request)

    @application.post("/api/assistant", response_model=Answer, tags=["assistant"])
    async def assistant(question: Question, response: Response) -> Answer:
        response.headers["Cache-Control"] = "no-store"
        async with httpx.AsyncClient() as client:
            return await answer_question(client, config, budget, question)

    return application


app = create_app()
