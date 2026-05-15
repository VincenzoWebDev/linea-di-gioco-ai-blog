<?php

use App\Jobs\News\FetchNewsJob;
use App\Models\NewsSource;
use App\Services\Agents\NewsScoutAgent;
use App\Services\GeopoliticsScopeService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('ai-news:dispatch {--force : Ignora il poll interval delle source}', function () {
    FetchNewsJob::dispatch((bool) $this->option('force'))
        ->onQueue(config('ai_news.queues.ingest', 'news-ingest'));

    $message = $this->option('force')
        ? 'Pipeline AI news dispatchata sulla coda ingest forzando il polling delle source.'
        : 'Pipeline AI news dispatchata sulla coda ingest.';

    $this->info($message);
})->purpose('Dispatch manuale della pipeline AI news');

Artisan::command('ai-news:run {--force : Ignora il poll interval delle source}', function () {
    FetchNewsJob::dispatch((bool) $this->option('force'))
        ->onQueue(config('ai_news.queues.ingest', 'news-ingest'));

    $this->info('Pipeline avviata: fetch RSS da news_sources (DB) → extract → CrewAI (/process) → publish.');
    $this->line('Assicurati che code e scheduler siano attivi (queue:work, schedule:work).');
    $this->line('Servizio Python: POST /process su '.config('ai_news.crewai.base_url', 'http://127.0.0.1:8001'));
})->purpose('Avvia il ciclo completo news (alias raccomandato di ai-news:dispatch)');

Artisan::command('ai-news:probe {--limit=5}', function (NewsScoutAgent $scout, GeopoliticsScopeService $scope) {
    $limit = max((int) $this->option('limit'), 1);
    $sources = NewsSource::query()->where('is_active', true)->get();

    if ($sources->isEmpty()) {
        $this->warn('Nessuna source attiva trovata. Esegui: php artisan db:seed --class=NewsSourceSeeder');
        return;
    }

    foreach ($sources as $source) {
        $items = $scout->discover($source);
        $this->line('');
        $this->info("Source: {$source->name} ({$source->type})");
        $this->line('Fetched items: '.count($items));

        $inScope = 0;
        foreach ($items as $item) {
            $ok = $scope->isInScope(
                (string) ($item['title'] ?? ''),
                (string) ($item['summary'] ?? ''),
                (string) ($item['url'] ?? '')
            );
            if ($ok) {
                $inScope++;
            }
        }
        $this->line("In-scope items: {$inScope}");

        foreach (array_slice($items, 0, $limit) as $i => $item) {
            $title = (string) ($item['title'] ?? '');
            $url = (string) ($item['url'] ?? '');
            $ok = $scope->isInScope(
                (string) ($item['title'] ?? ''),
                (string) ($item['summary'] ?? ''),
                (string) ($item['url'] ?? '')
            );
            $mark = $ok ? 'OK' : 'NO';
            $this->line("  [{$mark}] ".($i + 1).". {$title}");
            $this->line("       {$url}");
        }
    }
})->purpose('Diagnostica scout + filtro geopolitico per source');
