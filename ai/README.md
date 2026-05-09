# AI Agents Service (`ai/`) - AI First

Pipeline: Scout news geopolitiche -> CrewAI riscrive in italiano -> Dispatch a Laravel ingest.

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

- `GET /health`
- `POST /process` (singolo input)
- `POST /run-once?limit_per_source=5` (scouting + rewrite + dispatch completo)

## Test automazione completa

```bash
curl -X POST "http://127.0.0.1:8001/run-once?limit_per_source=3"
```

La risposta mostra quanti articoli sono stati inviati con successo a Laravel.

## Laravel

Nel `.env` di `webapp`:

```env
AI_NEWS_INGEST_TOKEN=change-me-ingest-token
```

Assicurati che API Laravel sia online su `http://127.0.0.1:8000`.
