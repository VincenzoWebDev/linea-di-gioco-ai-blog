<?php

namespace App\Jobs\News;

use App\Models\NewsSource;
use App\Services\Agents\NewsScoutAgent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 120, 300];

    public function handle(NewsScoutAgent $newsScoutAgent): void
    {
        $sources = NewsSource::query()
            ->where('is_active', true)
            ->get();

        foreach ($sources as $source) {
            $items = $newsScoutAgent->discover($source);

            foreach ($items as $item) {
                ParseAndStoreIncomingJob::dispatch($source->id, $item)
                    ->onQueue(config('ai_news.queues.ingest', 'news-ingest'));
            }
        }
    }
}

