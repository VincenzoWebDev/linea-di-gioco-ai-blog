# Linea di Gioco Blog

Blog automatizzato basato su AI per la raccolta, riscrittura, validazione e pubblicazione di notizie geopolitiche.

Il progetto è composto da due moduli collegati:

- `ai/`: servizio Python/FastAPI con CrewAI per la **riscrittura** (`POST /process`).
- `webapp/`: orchestratore — fonti RSS dal DB, fetch, extract, validazione, pubblicazione blog.

## Cosa fa il sistema (pipeline unificata v2)

1. **Laravel** legge le fonti attive dalla tabella `news_sources` (unica fonte di verità).
2. `FetchNewsJob` scarica i feed RSS e accoda ogni notizia in scope.
3. `ExtractSourceContentJob` estrae il testo dalla pagina articolo.
4. **Laravel → Python**: `SanitizerAgent` chiama `POST /process` sul servizio `ai` (3 agenti CrewAI).
5. Laravel valida, deduplica, persiste l'articolo e (se configurato) pubblica e genera immagini.

Avvio manuale del ciclo:

```bash
cd webapp
php artisan ai-news:run
```

`POST /run-once` sul servizio Python è deprecato (non fetcha più RSS).

## Architettura

### Modulo `ai/`

Tecnologie principali:

- Python 3.11+
- FastAPI
- Uvicorn
- CrewAI
- LiteLLM
- HTTPX
- python-dotenv
- Ollama o altro modello compatibile configurato via `CREWAI_MODEL`

Endpoint principali:

- `GET /health`
- `POST /process`

Responsabilità:

- riscrittura in italiano via CrewAI (3 agenti)
- estrazione metadati tensione geopolitica
- **non** fetch RSS (gestito da Laravel)

### Modulo `webapp/`

Tecnologie principali:

- PHP 8.1+
- Laravel 10
- MySQL
- Queue Laravel
- Inertia.js
- React 18
- Vite
- Tailwind CSS
- Sanctum

Responsabilità:

- gestione fonti `news_sources` (DB)
- fetch RSS, filtro geopolitico, extract HTML
- chiamata CrewAI (`CrewAiClient` → `ai/process`)
- ingest opzionale legacy (`POST /api/ai-news/ingest`)
- validazione strutturale e contenutistica
- deduplicazione notizie
- persistenza articoli e log di pubblicazione
- frontend pubblico del blog
- area admin autenticata
- generazione opzionale immagini con Gemini

## Struttura repository

```text
.
├── ai/        # servizio FastAPI + CrewAI per scouting, rewrite e dispatch
└── webapp/    # applicazione Laravel + React/Inertia del blog
```

## Requisiti

Per lavorare sul progetto servono:

- PHP `^8.1`
- Composer
- Node.js 18+ e npm
- Python 3.11+
- MySQL
- un sistema di queue funzionante
- opzionale: Ollama in locale per il rewrite AI
- opzionale: API key Gemini per la generazione immagini

Nota: in `webapp/.env.example` la queue di default è `sync`, utile per sviluppo rapido. Per un comportamento vicino alla produzione è meglio usare una queue reale e avviare i worker.

## Configurazione

### 1. Configurare Laravel

```bash
cd webapp
cp .env.example .env
composer install
php artisan key:generate
npm install
```

Imposta almeno queste variabili in `webapp/.env`:

```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nome_database
DB_USERNAME=utente
DB_PASSWORD=password

QUEUE_CONNECTION=database

AI_NEWS_INGEST_TOKEN=change-me-ingest-token
AI_NEWS_AUTO_PUBLISH=false

AI_NEWS_CREWAI_ENABLED=true
AI_NEWS_CREWAI_BASE_URL=http://127.0.0.1:8001
AI_NEWS_CREWAI_ENDPOINT=/process

AI_NEWS_IMAGES_ENABLED=false
```

Bootstrap database:

```bash
php artisan migrate
php artisan db:seed
```

I seed iniziali creano:

- categorie editoriali di base
- fonti RSS geopolitiche preconfigurate

### 2. Configurare il servizio AI

```bash
cd ai
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Su Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Variabili principali in `ai/.env`:

```env
CREWAI_MODEL=ollama/llama3.1
OLLAMA_BASE_URL=http://127.0.0.1:11434
CREWAI_REQUIRE_JSON=true

API_BIND_HOST=127.0.0.1
API_BIND_PORT=8001

LARAVEL_INGEST_URL=http://127.0.0.1:8000/api/ai-news/ingest
LARAVEL_INGEST_TOKEN=change-me-ingest-token
```

`LARAVEL_INGEST_TOKEN` deve corrispondere esattamente a `AI_NEWS_INGEST_TOKEN` della webapp.

## Avvio in locale

### Avvio `webapp`

Terminale 1:

```bash
cd webapp
php artisan serve
```

Terminale 2:

```bash
cd webapp
npm run dev
```

Terminale 3:

```bash
cd webapp
php artisan queue:work
```

Terminale 4:

```bash
cd webapp
php artisan schedule:work
```

### Avvio `ai`

```bash
cd ai
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## Modalità operative

### Eseguire un ciclo completo (Laravel orchestratore)

```bash
cd webapp
php artisan ai-news:run
```

Richiede `queue:work` attivo e servizio `ai` su porta 8001 con `AI_NEWS_CREWAI_ENABLED=true`.

### Testare solo la salute del servizio AI

```bash
curl "http://127.0.0.1:8001/health"
```

### Ingest manuale su Laravel

Endpoint:

```text
POST /api/ai-news/ingest
```

Protezione:

- middleware `ai.ingest`
- bearer token
- rate limit `120` richieste al minuto

## Pipeline Laravel (principale)

Orchestrata da `NewsPipelineOrchestrator` (transizioni in `IncomingNewsStateMachine`):

1. `FetchNewsJob` — RSS da `news_sources` (DB)
2. `ParseAndStoreIncomingJob` — filtro scope + dedup → `queueNewItem()`
3. `ExtractSourceContentJob` — HTML articolo (saltato se il testo è già presente)
4. `SanitizeIncomingNewsJob` — `CrewAiClient` → `POST /process` (Python)
5. `ValidateSanitizedArticleJob` → `PersistArticleJob` → `PublishArticleJob` / immagini

Ogni job, al termine, chiama `$pipeline->advance()` per il passo successivo.

**Ingest legacy** (`POST /api/ai-news/ingest`): per integrazioni esterne; gli articoli `rewrite_mode=crewai` non vengono risanitizzati due volte.

## Frontend e aree disponibili

La webapp espone:

- homepage pubblica del blog
- archivio articoli
- pagina dettaglio articolo
- pagina newsletter
- area admin autenticata con dashboard, post, categorie, media, pagine, utenti e impostazioni

## Tecnologie da utilizzare

Se contribuisci al progetto, lo stack di riferimento è:

- backend blog: Laravel 10 + PHP 8.1+
- frontend blog/admin: React 18 + Inertia.js + Vite + Tailwind CSS
- servizio agenti: Python + FastAPI + CrewAI
- LLM locale/remoto: Ollama tramite LiteLLM oppure provider compatibile
- database: MySQL
- code e job: queue Laravel
- immagini AI: Gemini opzionale

## Comandi utili

### Laravel

```bash
cd webapp
php artisan migrate
php artisan db:seed
php artisan queue:work
php artisan schedule:work
php artisan test
npm run dev
npm run build
```

### AI service

```bash
cd ai
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
python test_crew.py
```

## Note operative

- Il progetto è orientato a notizie geopolitiche in lingua italiana.
- La pubblicazione automatica è controllata da `AI_NEWS_AUTO_PUBLISH`.
- La qualità minima e le regole di deduplica sono configurabili in `webapp/config/ai_news.php`.
- Il modulo `ai` e `webapp` sono accoppiati tramite API HTTP e token condiviso.
- Per un setup locale completo, Laravel deve essere raggiungibile dall'AI service sull'URL definito in `LARAVEL_INGEST_URL`.

## Repository readiness

Questo README documenta il progetto a livello root per pubblicazione su GitHub. Le sottocartelle `ai/` e `webapp/` mantengono la loro responsabilità tecnica, ma il flusso di prodotto va letto come un unico sistema integrato.
