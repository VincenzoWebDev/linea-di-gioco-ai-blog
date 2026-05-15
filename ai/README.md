# AI Agents Service (`ai/`)

Servizio **solo riscrittura** CrewAI: Laravel gestisce fonti RSS (DB) e orchestrazione; questo modulo espone `POST /process`.

## Setup

```bash
cd ai
source .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
```

## Run API

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## Endpoints

- `GET /health` — stato servizio
- `POST /process` — riscrittura singola notizia (chiamato da Laravel `CrewAiClient`)
- `POST /run-once` — **deprecato (410)**; usare `php artisan ai-news:run` in `webapp/`

## Pipeline completa (Laravel)

```bash
cd webapp
php artisan ai-news:run
php artisan queue:work --queue=news-ingest,news-extract,news-sanitize,news-publish,news-images
```

Assicurati in `webapp/.env`:

```env
AI_NEWS_CREWAI_ENABLED=true
AI_NEWS_CREWAI_BASE_URL=http://127.0.0.1:8001
```

Fonti RSS: tabella `news_sources` (seed `NewsSourceSeeder`), non più file/env JSON in `ai/`.
