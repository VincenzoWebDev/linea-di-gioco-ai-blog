from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class ProcessRequest(BaseModel):
    title: str = Field(default="")
    summary: str = Field(default="")
    source_content: str = Field(default="")
    source_url: HttpUrl
    language: str = Field(default="it")
    domain: str = Field(default="geopolitics")


class GeopoliticalTensionOut(BaseModel):
    region_name: str
    risk_score: int = Field(ge=1, le=100)
    trend_direction: Literal["rising", "falling", "stable"] = "stable"
    status_label: str
    tension_summary: str = Field(description="Sintesi accessibile in italiano, esattamente 10 parole.")


class ArticleOut(BaseModel):
    title: str
    summary: str
    content: str
    topic: str = "geopolitica"
    categories: list[str] = Field(default_factory=lambda: ["geopolitica"])
    quality_score: float = Field(default=0.0, ge=0, le=100)
    source_url: str
    geopolitical_tension: GeopoliticalTensionOut | None = None


class ProcessResponse(BaseModel):
    article: ArticleOut
    trace: dict


class RunOnceResponse(BaseModel):
    fetched: int
    processed: int
    dispatched_ok: int
    dispatched_fail: int
    details: list[dict]
