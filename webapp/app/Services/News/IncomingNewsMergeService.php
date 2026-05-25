<?php

namespace App\Services\News;

use App\Enums\IncomingNewsStatus;
use App\Models\Article;
use App\Models\IncomingNews;
use App\Models\PublicationLog;
use Illuminate\Support\Facades\Log;

class IncomingNewsMergeService
{
    public function __construct(
        private readonly IncomingNewsStateMachine $stateMachine
    ) {
    }

    /**
     * @param  array<string, mixed>  $duplicate
     */
    public function absorbDuplicate(IncomingNews $incoming, array $duplicate): void
    {
        $articleId = isset($duplicate['matched_article_id'])
            ? (int) $duplicate['matched_article_id']
            : null;
        $primaryIncomingId = isset($duplicate['matched_incoming_news_id'])
            ? (int) $duplicate['matched_incoming_news_id']
            : null;

        if ($articleId) {
            $this->mergeIntoArticle($incoming, $articleId, $duplicate);

            return;
        }

        if ($primaryIncomingId) {
            $primary = IncomingNews::query()->find($primaryIncomingId);
            if ($primary) {
                $this->mergeIntoIncoming($incoming, $primary, $duplicate);

                return;
            }
        }

        Log::warning('ai_news_merge_missing_target', [
            'incoming_news_id' => $incoming->id,
            'duplicate' => $duplicate,
        ]);

        $this->stateMachine->reject($incoming, 'merge_target_not_found');
    }

    /**
     * @param  array<string, mixed>  $duplicate
     */
    public function mergeIntoArticle(IncomingNews $incoming, int $articleId, array $duplicate): void
    {
        $article = Article::query()->find($articleId);
        if (! $article) {
            $this->stateMachine->reject($incoming, 'merge_article_not_found');

            return;
        }

        PublicationLog::query()->create([
            'article_id' => $article->id,
            'event' => 'merged_duplicate_incoming',
            'meta' => $this->mergeMeta($incoming, $duplicate),
        ]);

        $this->markMerged($incoming, [
            'merged_into_article_id' => $article->id,
        ]);

        Log::info('ai_news_incoming_merged_into_article', [
            'incoming_news_id' => $incoming->id,
            'article_id' => $article->id,
            'duplicate_type' => $duplicate['type'] ?? null,
            'duplicate_score' => $duplicate['score'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $duplicate
     */
    public function mergeIntoIncoming(
        IncomingNews $secondary,
        IncomingNews $primary,
        array $duplicate
    ): void {
        if ($secondary->id === $primary->id) {
            return;
        }

        $primary->update([
            'sanitized_payload' => $this->combinePayloads(
                $primary->sanitized_payload ?? [],
                $secondary->sanitized_payload ?? [],
                $secondary
            ),
        ]);

        $this->markMerged($secondary, [
            'merged_into_incoming_news_id' => $primary->id,
        ]);

        Log::info('ai_news_incoming_merged_into_incoming', [
            'secondary_incoming_news_id' => $secondary->id,
            'primary_incoming_news_id' => $primary->id,
            'duplicate_type' => $duplicate['type'] ?? null,
            'duplicate_score' => $duplicate['score'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function markMerged(IncomingNews $incoming, array $attributes): void
    {
        $fromStatus = (string) $incoming->status;
        $targetStatus = IncomingNewsStatus::PUBLISHED;

        if ($this->stateMachine->canTransition($fromStatus, $targetStatus)) {
            $this->stateMachine->transition($incoming, $targetStatus, $attributes);

            return;
        }

        if ($this->stateMachine->canTransition($fromStatus, IncomingNewsStatus::VALIDATED)) {
            $incoming = $this->stateMachine->transition($incoming, IncomingNewsStatus::VALIDATED, $attributes);
        }

        if ($this->stateMachine->canTransition((string) $incoming->status, $targetStatus)) {
            $this->stateMachine->transition($incoming, $targetStatus);

            return;
        }

        $incoming->update([
            'status' => $targetStatus,
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $primary
     * @param  array<string, mixed>  $secondary
     * @return array<string, mixed>
     */
    private function combinePayloads(array $primary, array $secondary, IncomingNews $secondaryIncoming): array
    {
        $mergedSources = $primary['merged_sources'] ?? [];
        $mergedSources[] = [
            'incoming_news_id' => $secondaryIncoming->id,
            'source_name' => trim((string) ($secondaryIncoming->source?->name ?? '')),
            'source_url' => trim((string) ($secondaryIncoming->url ?? '')),
            'title' => (string) ($secondary['title'] ?? $secondaryIncoming->title ?? ''),
        ];

        $primary['merged_sources'] = $mergedSources;
        $primary['merged_incoming_ids'] = collect($mergedSources)
            ->pluck('incoming_news_id')
            ->filter()
            ->values()
            ->all();

        return $primary;
    }

    /**
     * @param  array<string, mixed>  $duplicate
     * @return array<string, mixed>
     */
    private function mergeMeta(IncomingNews $incoming, array $duplicate): array
    {
        return [
            'incoming_news_id' => $incoming->id,
            'source_name' => trim((string) ($incoming->source?->name ?? '')),
            'source_url' => trim((string) ($incoming->url ?? '')),
            'duplicate_type' => $duplicate['type'] ?? null,
            'duplicate_score' => $duplicate['score'] ?? null,
            'duplicate_reason' => $duplicate['reason'] ?? null,
        ];
    }
}
