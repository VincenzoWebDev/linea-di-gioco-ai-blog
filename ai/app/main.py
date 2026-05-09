from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException

from .crew_builder import run_pipeline
from .dispatch_client import send_to_laravel
from .schemas import ProcessRequest, ProcessResponse, RunOnceResponse
from .source_scout import discover_geopolitical_news

load_dotenv(Path(__file__).resolve().parents[1] / '.env')

app = FastAPI(title='AI Agents Service', version='1.1.1')


@app.get('/health')
def health() -> dict:
    return {'ok': True}


@app.post('/process', response_model=ProcessResponse)
def process(payload: ProcessRequest, authorization: str | None = Header(default=None)) -> ProcessResponse:
    _ = authorization
    try:
        article, trace = run_pipeline(payload)
        return ProcessResponse(article=article, trace=trace)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'process_failed: {exc}')


@app.post('/run-once', response_model=RunOnceResponse)
def run_once(limit_per_source: int = 5, max_items: int = 0) -> RunOnceResponse:
    items = discover_geopolitical_news(limit_per_source=max(limit_per_source, 1))
    if max_items > 0:
        items = items[:max_items]

    processed = 0
    ok = 0
    fail = 0
    details = []

    for item in items:
        req = ProcessRequest(
            title=item.get('title', ''),
            summary=item.get('summary', ''),
            source_content=item.get('summary', ''),
            source_url=item.get('url', 'https://example.com'),
            language='it',
            domain='geopolitics',
        )

        article, trace = run_pipeline(req)
        dispatch = send_to_laravel(
            article,
            source_name=item.get('source_name', 'AI Scout'),
            # Data+ora di pubblicazione: momento del run AI.
            published_at=datetime.now(timezone.utc).isoformat(),
        )
        processed += 1
        if dispatch.get('sent') is True:
            ok += 1
        else:
            fail += 1

        details.append(
            {
                'title': item.get('title', '')[:140],
                'source_url': item.get('url', ''),
                'trace_mode': trace.get('mode', 'unknown'),
                'dispatch': dispatch,
            }
        )

    return RunOnceResponse(
        fetched=len(items),
        processed=processed,
        dispatched_ok=ok,
        dispatched_fail=fail,
        details=details,
    )
