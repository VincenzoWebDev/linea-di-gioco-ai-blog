from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict

import httpx

from .schemas import ArticleOut


def send_to_laravel(
    article: ArticleOut,
    source_name: str = "AI Scout",
    published_at: str | None = None,
) -> Dict[str, Any]:
    url = os.getenv("LARAVEL_INGEST_URL", "").strip()
    token = os.getenv("LARAVEL_INGEST_TOKEN", "").strip()
    timeout = int(os.getenv("LARAVEL_INGEST_TIMEOUT_SECONDS", "25"))

    if not url:
        return {"sent": False, "reason": "missing_ingest_url"}
    if not token:
        return {"sent": False, "reason": "missing_ingest_token"}

    payload = {
        "title": article.title,
        "summary": article.summary,
        "content": article.content,
        "topic": article.topic,
        "categories": article.categories,
        "quality_score": article.quality_score,
        "source_url": article.source_url,
        "source_name": source_name,
        "rewrite_mode": "crewai",
        "language": "it",
        "published_at": published_at or datetime.now(timezone.utc).isoformat(),
    }

    try:
        with httpx.Client(timeout=timeout) as client:
            r = client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            if r.status_code >= 400:
                return {
                    "sent": False,
                    "reason": "laravel_error",
                    "status_code": r.status_code,
                    "body": r.text[:500],
                }
            return {"sent": True, "status_code": r.status_code, "response": r.json() if r.text else {}}
    except Exception as exc:
        return {"sent": False, "reason": "dispatch_exception", "error": str(exc)}
