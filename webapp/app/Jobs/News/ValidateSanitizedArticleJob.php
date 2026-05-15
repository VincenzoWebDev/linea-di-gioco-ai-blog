<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\IncomingNews;
use App\Services\ArticleValidationService;
use App\Services\News\IncomingNewsStateMachine;
use App\Services\News\NewsPipelineOrchestrator;
use App\Services\NewsDuplicateDetectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ValidateSanitizedArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public int $incomingNewsId)
    {
    }

    public function handle(
        ArticleValidationService $validationService,
        NewsDuplicateDetectionService $duplicateDetectionService,
        IncomingNewsStateMachine $stateMachine,
        NewsPipelineOrchestrator $pipeline
    ): void {
        $incoming = IncomingNews::query()->find($this->incomingNewsId);
        if (! $incoming) {
            return;
        }

        $duplicate = $duplicateDetectionService->detect($incoming, $incoming->sanitized_payload ?? []);
        if (($duplicate['is_duplicate'] ?? false) === true) {
            $stateMachine->reject($incoming, $this->duplicateReason($duplicate));

            return;
        }

        $result = $validationService->validateSanitizedPayload($incoming->sanitized_payload ?? []);
        if (! $result['valid']) {
            $stateMachine->reject($incoming, implode('; ', $result['errors']));

            return;
        }

        $stateMachine->transition($incoming, IncomingNewsStatus::VALIDATED);
        $pipeline->advance($incoming);
    }

    /**
     * @param  array<string, mixed>  $duplicate
     */
    private function duplicateReason(array $duplicate): string
    {
        $reason = (string) ($duplicate['reason'] ?? 'duplicate_detected');
        $type = (string) ($duplicate['type'] ?? 'unknown');
        $articleId = isset($duplicate['matched_article_id']) ? (int) $duplicate['matched_article_id'] : null;
        $score = isset($duplicate['score']) ? (float) $duplicate['score'] : null;

        $parts = [$reason, "type={$type}"];
        if ($articleId) {
            $parts[] = "article_id={$articleId}";
        }
        if ($score !== null) {
            $parts[] = 'score='.number_format($score, 4, '.', '');
        }

        return implode('; ', $parts);
    }
}
