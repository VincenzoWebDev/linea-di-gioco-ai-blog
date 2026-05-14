<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\IncomingNews;
use App\Services\GeopoliticsScopeService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ParseAndStoreIncomingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 120, 300];

    /**
     * @param array<string, mixed> $rawNews
     */
    public function __construct(
        public int $newsSourceId,
        public array $rawNews
    ) {
    }

    public function handle(GeopoliticsScopeService $scopeService): void
    {
        $title = trim((string) ($this->rawNews['title'] ?? ''));
        $summary = trim((string) ($this->rawNews['summary'] ?? ''));
        $url = trim((string) ($this->rawNews['url'] ?? ''));
        $publishedAt = (string) ($this->rawNews['published_at'] ?? now()->toIso8601String());
        $fingerprint = hash('sha256', mb_strtolower($title.'|'.$url.'|'.$publishedAt));

        if (! $scopeService->isInScope($title, $summary, $url)) {
            Log::info('ai_news_item_rejected_out_of_scope', [
                'news_source_id' => $this->newsSourceId,
                'title' => $title,
                'url' => $url,
            ]);

            if ((bool) config('ai_news.scope.store_rejected', false)) {
                $this->firstOrCreateByFingerprint(
                    $fingerprint,
                    [
                        'news_source_id' => $this->newsSourceId,
                        'external_id' => (string) ($this->rawNews['external_id'] ?? ''),
                        'url' => $url,
                        'title' => $title !== '' ? $title : 'out_of_scope',
                        'summary' => $summary !== '' ? $summary : null,
                        'raw_payload' => $this->rawNews,
                        'published_at' => Carbon::parse($publishedAt),
                        'status' => IncomingNewsStatus::REJECTED,
                        'rejection_reason' => 'out_of_scope_geopolitics',
                    ]
                );
            }

            return;
        }

        $incoming = $this->firstOrCreateByFingerprint(
            $fingerprint,
            [
                'news_source_id' => $this->newsSourceId,
                'external_id' => (string) ($this->rawNews['external_id'] ?? ''),
                'url' => $url,
                'title' => $title,
                'summary' => $summary !== '' ? $summary : null,
                'raw_payload' => $this->rawNews,
                'published_at' => Carbon::parse($publishedAt),
                'status' => IncomingNewsStatus::RAW,
            ]
        );

        if (! $incoming->wasRecentlyCreated) {
            Log::info('ai_news_item_skipped_duplicate_fingerprint', [
                'news_source_id' => $this->newsSourceId,
                'title' => $title,
                'url' => $url,
            ]);

            return;
        }

        $incoming->update(['status' => IncomingNewsStatus::QUEUED]);

        Log::info('ai_news_item_queued_for_extraction', [
            'incoming_news_id' => $incoming->id,
            'news_source_id' => $this->newsSourceId,
            'queue_extract' => config('ai_news.queues.extract', 'news-extract'),
        ]);

        ExtractSourceContentJob::dispatch($incoming->id)
            ->onQueue(config('ai_news.queues.extract', 'news-extract'));
    }

    /**
     * @param array<string, mixed> $attributes
     */
    private function firstOrCreateByFingerprint(string $fingerprint, array $attributes): IncomingNews
    {
        try {
            return IncomingNews::query()->firstOrCreate(
                ['fingerprint' => $fingerprint],
                [
                    ...$attributes,
                    'fingerprint' => $fingerprint,
                ]
            );
        } catch (UniqueConstraintViolationException) {
            return IncomingNews::query()
                ->where('fingerprint', $fingerprint)
                ->firstOrFail();
        }
    }
}
