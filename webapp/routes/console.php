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

Artisan::command('ai-news:dispatch', function () {
    FetchNewsJob::dispatch()->onQueue(config('ai_news.queues.ingest', 'news-ingest'));

    $this->info('Pipeline AI news dispatchata sulla coda ingest.');
})->purpose('Dispatch manuale della pipeline AI news');

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
