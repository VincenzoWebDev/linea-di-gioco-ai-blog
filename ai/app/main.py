from pathlib import Path
import os
import secrets

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException

from .crew_builder import run_pipeline
from .schemas import ProcessRequest, ProcessResponse

load_dotenv(Path(__file__).resolve().parents[1] / '.env')

app = FastAPI(title='AI Agents Service', version='2.0.0')


@app.get('/health')
def health() -> dict:
    return {
        'ok': True,
        'role': 'rewrite_only',
        'note': 'RSS discovery runs in Laravel (news_sources DB). Use POST /process.',
    }


@app.post('/process', response_model=ProcessResponse)
def process(payload: ProcessRequest, authorization: str | None = Header(default=None)) -> ProcessResponse:
    _ensure_api_token(authorization)
    try:
        article, trace = run_pipeline(payload)
        return ProcessResponse(article=article, trace=trace)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'process_failed: {exc}')


@app.post('/run-once')
def run_once_deprecated() -> None:
    raise HTTPException(
        status_code=410,
        detail=(
            'run_once_removed: le fonti RSS sono gestite solo da Laravel (tabella news_sources). '
            'Avvia la pipeline con: php artisan ai-news:run'
        ),
    )


def _ensure_api_token(authorization: str | None) -> None:
    expected = os.getenv('CREWAI_API_KEY', '').strip()
    if expected == '':
        return

    provided = (authorization or '').strip()
    prefix = 'Bearer '

    if not provided.startswith(prefix):
        raise HTTPException(status_code=401, detail='unauthorized')

    token = provided[len(prefix):].strip()
    if token == '' or not secrets.compare_digest(expected, token):
        raise HTTPException(status_code=401, detail='unauthorized')
