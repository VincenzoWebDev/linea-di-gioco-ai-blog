<?php

namespace App\Jobs\News;

use App\Services\News\IncomingNewsIngestService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ReceiveAiArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 90, 300];

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public array $payload,
        public string $idempotencyKey
    ) {
    }

    public function handle(IncomingNewsIngestService $ingestService): void
    {
        $ingestService->ingest($this->payload, $this->idempotencyKey);
    }
}
