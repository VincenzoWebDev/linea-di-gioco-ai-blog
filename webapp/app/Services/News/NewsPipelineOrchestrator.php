<?php

namespace App\Services\News;

use App\Enums\IncomingNewsStatus;
use App\Jobs\News\ExtractSourceContentJob;
use App\Jobs\News\PersistArticleJob;
use App\Jobs\News\SanitizeIncomingNewsJob;
use App\Jobs\News\ValidateSanitizedArticleJob;
use App\Models\IncomingNews;
use Illuminate\Support\Facades\Log;

class NewsPipelineOrchestrator
{
    private const MIN_SOURCE_CONTENT_CHARS = 80;

    public function __construct(
        private readonly IncomingNewsStateMachine $stateMachine
    ) {
    }

    public function advance(IncomingNews|int $incoming): void
    {
        if (is_int($incoming)) {
            $incoming = IncomingNews::query()->find($incoming);
        }

        if (! $incoming) {
            return;
        }

        $incoming->refresh();
        $status = (string) $incoming->status;

        if (in_array($status, [IncomingNewsStatus::REJECTED, IncomingNewsStatus::PUBLISHED], true)) {
            return;
        }

        match ($status) {
            IncomingNewsStatus::QUEUED => $this->advanceFromQueued($incoming),
            IncomingNewsStatus::EXTRACTED => $this->dispatchSanitize($incoming),
            IncomingNewsStatus::SANITIZED => $this->dispatchValidate($incoming),
            IncomingNewsStatus::VALIDATED => $this->dispatchPersist($incoming),
            default => Log::warning('ai_news_pipeline_no_advance_for_status', [
                'incoming_news_id' => $incoming->id,
                'status' => $status,
            ]),
        };
    }

    public function queueNewItem(IncomingNews $incoming): void
    {
        $this->stateMachine->transition($incoming, IncomingNewsStatus::QUEUED);
        $this->advance($incoming);
    }

    public function shouldSkipSanitize(IncomingNews $incoming): bool
    {
        $payload = $incoming->sanitized_payload ?? [];

        return is_array($payload)
            && ($payload['rewrite_mode'] ?? '') === 'crewai'
            && $incoming->sanitized_at !== null;
    }

    private function advanceFromQueued(IncomingNews $incoming): void
    {
        if ($this->hasUsableSourceContent($incoming)) {
            Log::info('ai_news_pipeline_skip_extract', ['incoming_news_id' => $incoming->id]);

            $this->dispatchSanitize($incoming);

            return;
        }

        $this->dispatchExtract($incoming);
    }

    private function hasUsableSourceContent(IncomingNews $incoming): bool
    {
        return mb_strlen(trim((string) $incoming->source_content)) >= self::MIN_SOURCE_CONTENT_CHARS;
    }

    private function dispatchExtract(IncomingNews $incoming): void
    {
        ExtractSourceContentJob::dispatch($incoming->id)
            ->onQueue(config('ai_news.queues.extract', 'news-extract'));
    }

    private function dispatchSanitize(IncomingNews $incoming): void
    {
        SanitizeIncomingNewsJob::dispatch($incoming->id)
            ->onQueue(config('ai_news.queues.sanitize', 'news-sanitize'));
    }

    private function dispatchValidate(IncomingNews $incoming): void
    {
        ValidateSanitizedArticleJob::dispatch($incoming->id)
            ->onQueue(config('ai_news.queues.publish', 'news-publish'));
    }

    private function dispatchPersist(IncomingNews $incoming): void
    {
        PersistArticleJob::dispatch($incoming->id)
            ->onQueue(config('ai_news.queues.publish', 'news-publish'));
    }
}
