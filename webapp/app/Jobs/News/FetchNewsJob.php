<?php

namespace App\Jobs\News;

use App\Models\NewsSource;
use App\Services\Agents\NewsScoutAgent;
use App\Services\News\AiNewsWorkflowService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FetchNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 120, 300];

    public function __construct(
        private readonly bool $forcePoll = false,
        private readonly ?string $triggeredAt = null
    ) {}

    public function handle(
        NewsScoutAgent $newsScoutAgent,
        AiNewsWorkflowService $workflowService
    ): void {
        $workflow = $workflowService->sessionMetadata($this->triggeredAt);

        if (! $this->forcePoll && ! $workflowService->isAllowedTriggerTime($workflow['triggered_at'])) {
            Log::info('ai_news_fetch_rejected_outside_trigger_window', [
                'triggered_at' => $workflow['triggered_at'],
                'allowed_hours' => $workflowService->allowedTriggerHours(),
            ]);

            return;
        }

        $sources = NewsSource::query()
            ->where('is_active', true)
            ->get();

        if ($sources->isEmpty()) {
            Log::warning('ai_news_fetch_no_active_sources');

            return;
        }

        $processedSources = 0;
        $skippedSources = 0;
        $dispatchedItems = 0;

        foreach ($sources as $source) {
            if (! $this->shouldPollSource($source)) {
                $skippedSources++;

                continue;
            }

            $items = $newsScoutAgent->discover($source);
            $processedSources++;

            Log::info('ai_news_fetch_source_result', [
                'source_id' => $source->id,
                'source_name' => $source->name,
                'source_type' => $source->type,
                'items_found' => count($items),
            ]);

            foreach ($items as $item) {
                $item['_workflow'] = $workflow;

                ParseAndStoreIncomingJob::dispatch($source->id, $item)
                    ->onQueue(config('ai_news.queues.ingest', 'news-ingest'));
                $dispatchedItems++;
            }

            $this->markSourcePolled($source);
        }

        Log::info('ai_news_fetch_cycle_completed', [
            'active_sources' => $sources->count(),
            'processed_sources' => $processedSources,
            'skipped_sources' => $skippedSources,
            'dispatched_items' => $dispatchedItems,
            'workflow_session_key' => $workflow['session_key'],
            'workflow_triggered_at' => $workflow['triggered_at'],
            'workflow_session_ai_quota' => $workflow['session_ai_quota'],
            'queue_ingest' => config('ai_news.queues.ingest', 'news-ingest'),
        ]);
    }

    private function shouldPollSource(NewsSource $source): bool
    {
        if ($this->forcePoll) {
            return true;
        }

        $interval = max((int) ($source->poll_interval_minutes ?? 10), 1);
        $lastPolledAt = Cache::get($this->pollCacheKey($source->id));

        if (! is_string($lastPolledAt) || $lastPolledAt === '') {
            return true;
        }

        return now()->diffInMinutes($lastPolledAt) >= $interval;
    }

    private function markSourcePolled(NewsSource $source): void
    {
        $interval = max((int) ($source->poll_interval_minutes ?? 10), 1);

        Cache::put(
            $this->pollCacheKey($source->id),
            now()->toIso8601String(),
            now()->addMinutes($interval * 2)
        );
    }

    private function pollCacheKey(int $sourceId): string
    {
        return 'ai_news:last_polled:'.$sourceId;
    }
}
