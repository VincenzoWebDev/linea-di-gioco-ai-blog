<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\AgentRun;
use App\Models\IncomingNews;
use App\Services\Agents\SanitizerAgent;
use App\Services\News\IncomingNewsStateMachine;
use App\Services\News\NewsPipelineOrchestrator;
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

    public function handle(
        SanitizerAgent $sanitizerAgent,
        IncomingNewsStateMachine $stateMachine,
        NewsPipelineOrchestrator $pipeline
    ): void {
        $incoming = IncomingNews::query()->find($this->incomingNewsId);
        if (! $incoming) {
            return;
        }

        if ($pipeline->shouldSkipSanitize($incoming)) {
            if ((string) $incoming->status !== IncomingNewsStatus::SANITIZED) {
                $stateMachine->transition($incoming, IncomingNewsStatus::SANITIZED);
            }
            $pipeline->advance($incoming);

            return;
        }

        try {
            $sanitized = $sanitizerAgent->sanitize([
                ...($incoming->raw_payload ?? []),
                'source_content' => $incoming->source_content,
                'url' => $incoming->url,
                'source_url' => $incoming->url,
            ]);

            AgentRun::query()->create([
                'incoming_news_id' => $incoming->id,
                'agent_name' => 'SanitizerAgent',
                'prompt_version' => (string) config('ai_news.sanitize_prompt_version', 'v1'),
                'status' => 'success',
                'result_payload' => [
                    'rewrite_mode' => $sanitized['rewrite_mode'] ?? 'unknown',
                ],
            ]);

            $stateMachine->transition($incoming, IncomingNewsStatus::SANITIZED, [
                'sanitized_payload' => $sanitized,
                'quality_score' => $sanitized['quality_score'] ?? null,
                'sanitized_at' => now(),
            ]);

            $pipeline->advance($incoming);
        } catch (Throwable $exception) {
            AgentRun::query()->create([
                'incoming_news_id' => $incoming->id,
                'agent_name' => 'SanitizerAgent',
                'prompt_version' => (string) config('ai_news.sanitize_prompt_version', 'v1'),
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            $stateMachine->reject($incoming, 'sanitizer_failed');

            throw $exception;
        }
    }
}
