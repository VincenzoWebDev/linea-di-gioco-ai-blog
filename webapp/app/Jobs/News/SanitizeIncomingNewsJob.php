<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\AgentRun;
use App\Models\IncomingNews;
use App\Services\Agents\SanitizerAgent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class SanitizeIncomingNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [60, 180, 600];

    public function __construct(public int $incomingNewsId)
    {
    }

    public function handle(SanitizerAgent $sanitizerAgent): void
    {
        $incoming = IncomingNews::query()->find($this->incomingNewsId);
        if (! $incoming) {
            return;
        }

        try {
            $sanitized = $sanitizerAgent->sanitize([
                ...($incoming->raw_payload ?? []),
                'source_content' => $incoming->source_content,
            ]);

            AgentRun::query()->create([
                'incoming_news_id' => $incoming->id,
                'agent_name' => 'SanitizerAgent',
                'prompt_version' => (string) config('ai_news.sanitize_prompt_version', 'v1'),
                'status' => 'success',
                'result_payload' => $sanitized,
            ]);

            $incoming->update([
                'sanitized_payload' => $sanitized,
                'quality_score' => $sanitized['quality_score'] ?? null,
                'sanitized_at' => now(),
                'status' => IncomingNewsStatus::SANITIZED,
            ]);

            ValidateSanitizedArticleJob::dispatch($incoming->id)
                ->onQueue(config('ai_news.queues.publish', 'news-publish'));
        } catch (Throwable $exception) {
            AgentRun::query()->create([
                'incoming_news_id' => $incoming->id,
                'agent_name' => 'SanitizerAgent',
                'prompt_version' => (string) config('ai_news.sanitize_prompt_version', 'v1'),
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            $incoming->update([
                'status' => IncomingNewsStatus::REJECTED,
                'rejection_reason' => 'sanitizer_failed',
            ]);

            throw $exception;
        }
    }
}
