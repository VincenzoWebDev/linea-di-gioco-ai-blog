<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\AgentRun;
use App\Models\IncomingNews;
use App\Services\News\IncomingNewsStateMachine;
use App\Services\News\NewsPipelineOrchestrator;
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

    public function handle(
        SourceContentExtractor $extractor,
        IncomingNewsStateMachine $stateMachine,
        NewsPipelineOrchestrator $pipeline
    ): void {
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

                $stateMachine->reject($incoming, 'extractor_'.$result['error']);

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

            $stateMachine->transition($incoming, IncomingNewsStatus::EXTRACTED, [
                'source_content' => (string) $result['content'],
                'extracted_at' => now(),
            ]);

            $pipeline->advance($incoming);
        } catch (Throwable $exception) {
            if ($incoming = IncomingNews::query()->find($this->incomingNewsId)) {
                $stateMachine->reject($incoming, 'extractor_exception');
            }

            throw $exception;
        }
    }
}
