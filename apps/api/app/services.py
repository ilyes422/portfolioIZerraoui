"""Stockage partagé facultatif et quotas du fournisseur de génération."""

import time
from typing import Any

import httpx

from app.config import Settings


class Redis:
    def __init__(self, settings: Settings):
        self.url = settings.upstash_redis_rest_url.rstrip("/") if settings.upstash_redis_rest_url else ""
        token = settings.upstash_redis_rest_token
        self.token = token.get_secret_value() if token else ""

    @property
    def enabled(self) -> bool:
        return bool(self.url and self.token)

    async def command(self, client: httpx.AsyncClient, *arguments: Any) -> Any:
        response = await client.post(
            self.url, json=list(arguments),
            headers={"Authorization": f"Bearer {self.token}"}, timeout=3,
        )
        response.raise_for_status()
        body = response.json()
        if body.get("error"):
            raise ValueError("Redis a rejeté la commande.")
        return body.get("result")


_RATE_LIMIT = """
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local day = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= tonumber(ARGV[1]) or day >= tonumber(ARGV[2]) then return 0 end
if redis.call('INCR', KEYS[1]) == 1 then redis.call('EXPIRE', KEYS[1], 120) end
if redis.call('INCR', KEYS[2]) == 1 then redis.call('EXPIRE', KEYS[2], 172800) end
return 1
"""


class GenerationBudget:
    """Plafond global en production, plafond par processus en développement."""

    def __init__(self, settings: Settings, redis: Redis):
        self.settings = settings
        self.redis = redis
        self.counts: dict[str, tuple[int, int]] = {}

    async def take(self, client: httpx.AsyncClient) -> bool:
        now = int(time.time())
        minute, day = now // 60, now // 86400
        minute_limit, day_limit = self.settings.llm_requests_per_minute, self.settings.llm_requests_per_day
        if self.redis.enabled:
            try:
                return await self.redis.command(
                    client, "EVAL", _RATE_LIMIT, 2,
                    f"portfolio:llm:minute:{minute}", f"portfolio:llm:day:{day}", minute_limit, day_limit,
                ) == 1
            except (httpx.HTTPError, ValueError):
                return False
        if self.settings.app_env == "production":
            return False

        minute_count = self._count("minute", minute)
        day_count = self._count("day", day)
        if minute_count >= minute_limit or day_count >= day_limit:
            return False
        self.counts["minute"] = (minute, minute_count + 1)
        self.counts["day"] = (day, day_count + 1)
        return True

    def _count(self, name: str, bucket: int) -> int:
        previous, count = self.counts.get(name, (-1, 0))
        return count if previous == bucket else 0
