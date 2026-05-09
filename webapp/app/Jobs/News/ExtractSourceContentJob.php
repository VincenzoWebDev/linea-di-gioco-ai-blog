<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\AgentRun;
use App\Models\IncomingNews;
use App\Services\SourceContentExtractor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ExtractSourceContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [45, 120, 300];

    public function __construct(public int $incomingNewsId)
    {
    }

    public function handle(SourceContentExtractor $extractor): void
    {
        $incoming = IncomingNews::query()->find($this->incomingNewsId);
        if (! $incoming) {
            return;
        }

        try {
            $result = $extractor->extract((string) $incoming->url);

            if (! empty($result['error'])) {
                AgentRun::query()->create([
                    'incoming_news_id' => $incoming->id,
                    'agent_name' => 'SourceContentExtractor',
                    'prompt_version' => 'extractor-v1',
                    'status' => 'failed',
                    'error_message' => (string) $result['error'],
                ]);

                $incoming->update([
                    'status' => IncomingNewsStatus::REJECTED,
                    'rejection_reason' => 'extractor_'.$result['error'],
                ]);

                return;
            }

            AgentRun::query()->create([
                'incoming_news_id' => $incoming->id,
                'agent_name' => 'SourceContentExtractor',
                'prompt_version' => 'extractor-v1',
                'status' => 'success',
                'result_payload' => [
                    'chars' => mb_strlen((string) $result['content']),
                ],
            ]);

            $incoming->update([
                'source_content' => (string) $result['content'],
                'extracted_at' => now(),
                'status' => IncomingNewsStatus::EXTRACTED,
            ]);

            SanitizeIncomingNewsJob::dispatch($incoming->id)
                ->onQueue(config('ai_news.queues.sanitize', 'news-sanitize'));
        } catch (Throwable $exception) {
            IncomingNews::query()
                ->whereKey($this->incomingNewsId)
                ->update([
                'status' => IncomingNewsStatus::REJECTED,
                'rejection_reason' => 'extractor_exception',
                ]);

            throw $exception;
        }
    }
}
