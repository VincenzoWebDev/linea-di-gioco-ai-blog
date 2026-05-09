from pydantic import BaseModel, Field, HttpUrl


class ProcessRequest(BaseModel):
    title: str = Field(default="")
    summary: str = Field(default="")
    source_content: str = Field(default="")
    source_url: HttpUrl
    language: str = Field(default="it")
    domain: str = Field(default="geopolitics")


class ArticleOut(BaseModel):
    title: str
    summary: str
    content: str
    topic: str = "geopolitica"
    categories: list[str] = Field(default_factory=lambda: ["geopolitica"])
    quality_score: float = 0.0
    source_url: str


class ProcessResponse(BaseModel):
    article: ArticleOut
    trace: dict


class RunOnceResponse(BaseModel):
    fetched: int
    processed: int
    dispatched_ok: int
    dispatched_fail: int
    details: list[dict]
