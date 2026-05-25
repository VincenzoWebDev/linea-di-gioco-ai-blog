<?php

namespace App\Services;

use App\Enums\IncomingNewsStatus;
use App\Models\Article;
use App\Models\IncomingNews;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class NewsDuplicateDetectionService
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *     is_duplicate: bool,
     *     action: 'none'|'merge'|'reject',
     *     type: string|null,
     *     matched_article_id: int|null,
     *     matched_incoming_news_id: int|null,
     *     score: float|null,
     *     reason: string
     * }
     */
    public function detect(IncomingNews $incoming, array $payload): array
    {
        $enabled = (bool) config('ai_news.deduplication.enabled', true);
        if (! $enabled) {
            return $this->notDuplicate('deduplication_disabled');
        }

        $incoming->loadMissing('source');

        $title = (string) ($payload['title'] ?? $incoming->title ?? '');
        $summary = (string) ($payload['summary'] ?? $incoming->summary ?? '');
        $content = (string) ($payload['content'] ?? $incoming->source_content ?? '');
        $sourceUrl = trim((string) ($payload['source_url'] ?? $incoming->url ?? ''));
        $externalId = trim((string) ($incoming->external_id ?? $payload['external_id'] ?? ''));

        $exact = $this->detectExactDuplicate($incoming, $title, $sourceUrl, $externalId);
        if ($exact !== null) {
            return $exact;
        }

        $mergeSimilar = (bool) config('ai_news.deduplication.merge_similar', true);
        if (! $mergeSimilar) {
            return $this->notDuplicate('not_duplicate');
        }

        $targetText = $this->normalizeText(trim($title.' '.$summary.' '.Str::limit($content, 1200, '')));
        $targetTokens = $this->tokens($targetText);
        if ($targetTokens === []) {
            return $this->notDuplicate('dedupe_insufficient_text');
        }

        $lookbackDays = max(1, (int) config('ai_news.deduplication.lookback_days', 14));
        $candidateLimit = max(10, (int) config('ai_news.deduplication.candidate_limit', 80));
        $threshold = (float) config('ai_news.deduplication.similarity_threshold', 0.72);
        $rejectSince = Carbon::now()->subDays($lookbackDays);
        $workflowSince = $this->mergeWorkflowSince();

        if ((bool) config('ai_news.deduplication.merge_pending_incoming', true)) {
            $incomingMatch = $this->bestCrossSourcePendingIncomingMatch(
                $incoming,
                $targetTokens,
                $workflowSince,
                $candidateLimit,
                $threshold
            );
            if ($incomingMatch !== null) {
                return $this->duplicateResult(
                    'similar_pending_incoming_cross_source',
                    'merge_similar_cross_source_incoming',
                    $incomingMatch['score'],
                    null,
                    $incomingMatch['id'],
                    'merge'
                );
            }
        }

        $sameSourceMatch = $this->bestSameSourceSimilarityMatch(
            $incoming,
            $targetTokens,
            $rejectSince,
            $workflowSince,
            $candidateLimit,
            $threshold
        );
        if ($sameSourceMatch !== null) {
            return $this->duplicateResult(
                'similar_context_same_source',
                'duplicate_similar_same_source',
                $sameSourceMatch['score'],
                $sameSourceMatch['article_id'],
                $sameSourceMatch['incoming_id'],
                'reject'
            );
        }

        return $this->notDuplicate('not_duplicate');
    }

    /**
     * Duplicati rigidi: stesso URL, titolo, external_id → scarto (come prima).
     *
     * @return array<string, mixed>|null
     */
    private function detectExactDuplicate(
        IncomingNews $incoming,
        string $title,
        string $sourceUrl,
        string $externalId
    ): ?array {
        if ($sourceUrl !== '') {
            $exactByUrl = Article::query()
                ->where('source_url', $sourceUrl)
                ->latest('id')
                ->first();
            if ($exactByUrl) {
                return $this->duplicateResult(
                    'exact_url',
                    'duplicate_exact_url',
                    1.0,
                    $exactByUrl->id,
                    null,
                    'reject'
                );
            }

            $incomingByUrl = $this->findOtherIncoming($incoming)
                ->where('url', $sourceUrl)
                ->first();
            if ($incomingByUrl) {
                return $this->duplicateResult(
                    'exact_url_incoming',
                    'duplicate_exact_url_incoming',
                    1.0,
                    null,
                    $incomingByUrl->id,
                    'reject'
                );
            }
        }

        if ($title !== '') {
            $exactByTitle = Article::query()
                ->whereRaw('LOWER(title) = ?', [mb_strtolower($title)])
                ->latest('id')
                ->first();
            if ($exactByTitle) {
                return $this->duplicateResult(
                    'exact_title',
                    'duplicate_exact_title',
                    1.0,
                    $exactByTitle->id,
                    null,
                    'reject'
                );
            }

            $incomingByTitle = $this->findOtherIncoming($incoming)
                ->whereRaw('LOWER(title) = ?', [mb_strtolower($title)])
                ->first();
            if ($incomingByTitle) {
                return $this->duplicateResult(
                    'exact_title_incoming',
                    'duplicate_exact_title_incoming',
                    1.0,
                    null,
                    $incomingByTitle->id,
                    'reject'
                );
            }
        }

        if ($externalId !== '') {
            $incomingByExternalId = $this->findOtherIncoming($incoming)
                ->where('external_id', $externalId)
                ->first();
            if ($incomingByExternalId) {
                return $this->duplicateResult(
                    'exact_external_id',
                    'duplicate_exact_external_id',
                    1.0,
                    null,
                    $incomingByExternalId->id,
                    'reject'
                );
            }
        }

        return null;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder<IncomingNews>
     */
    private function findOtherIncoming(IncomingNews $incoming)
    {
        return IncomingNews::query()
            ->where('id', '!=', $incoming->id)
            ->whereNotIn('status', [IncomingNewsStatus::REJECTED])
            ->whereNull('merged_into_article_id')
            ->whereNull('merged_into_incoming_news_id');
    }

    private function mergeWorkflowSince(): Carbon
    {
        $configured = config('ai_news.deduplication.merge_workflow_window_minutes');
        $minutes = is_numeric($configured) && (int) $configured > 0
            ? (int) $configured
            : (int) config('ai_news.schedule_every_minutes', 60);

        return Carbon::now()->subMinutes(max(15, min(240, $minutes)));
    }

    /**
     * @param  array<int, string>  $targetTokens
     * @return array{id: int, score: float}|null
     */
    private function bestCrossSourcePendingIncomingMatch(
        IncomingNews $incoming,
        array $targetTokens,
        Carbon $since,
        int $candidateLimit,
        float $threshold
    ): ?array {
        $candidates = IncomingNews::query()
            ->with('source:id,name')
            ->where('id', '!=', $incoming->id)
            ->whereIn('status', [
                IncomingNewsStatus::SANITIZED,
                IncomingNewsStatus::VALIDATED,
            ])
            ->whereDoesntHave('article')
            ->whereNull('merged_into_article_id')
            ->whereNull('merged_into_incoming_news_id')
            ->where('created_at', '>=', $since)
            ->where(function ($query) use ($incoming): void {
                $query->where('created_at', '<', $incoming->created_at)
                    ->orWhere(function ($nested) use ($incoming): void {
                        $nested->where('created_at', '=', $incoming->created_at)
                            ->where('id', '<', $incoming->id);
                    });
            })
            ->where('news_source_id', '!=', $incoming->news_source_id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->limit($candidateLimit)
            ->get(['id', 'title', 'summary', 'source_content', 'sanitized_payload', 'news_source_id']);

        return $this->bestSimilarityMatch(
            $targetTokens,
            $candidates,
            $threshold,
            function ($candidate) {
                $payload = is_array($candidate->sanitized_payload) ? $candidate->sanitized_payload : [];

                return $this->normalizeText(trim(
                    (string) ($payload['title'] ?? $candidate->title).' '
                    .(string) ($payload['summary'] ?? $candidate->summary).' '
                    .Str::limit((string) ($payload['content'] ?? $candidate->source_content ?? ''), 900, '')
                ));
            }
        );
    }

    /**
     * @param  array<int, string>  $targetTokens
     * @return array{score: float, article_id: int|null, incoming_id: int|null}|null
     */
    private function bestSameSourceSimilarityMatch(
        IncomingNews $incoming,
        array $targetTokens,
        Carbon $rejectSince,
        Carbon $workflowSince,
        int $candidateLimit,
        float $threshold
    ): ?array {
        $bestScore = 0.0;
        $bestArticleId = null;
        $bestIncomingId = null;

        $articles = Article::query()
            ->with('incomingNews:id,news_source_id')
            ->where(function ($q): void {
                $q->where('created_by', 'ai')
                    ->orWhere('status', 'published');
            })
            ->where('created_at', '>=', $rejectSince)
            ->latest('id')
            ->limit($candidateLimit)
            ->get(['id', 'title', 'summary', 'content', 'incoming_news_id', 'source_name']);

        foreach ($articles as $article) {
            if ($this->isDifferentSource($incoming, $article->incomingNews?->news_source_id, (string) $article->source_name)) {
                continue;
            }

            $score = $this->similarityScore(
                $targetTokens,
                $this->normalizeText(trim(
                    (string) $article->title.' '.(string) $article->summary.' '.Str::limit((string) $article->content, 900, '')
                ))
            );

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestArticleId = $article->id;
                $bestIncomingId = null;
            }
        }

        $incomings = IncomingNews::query()
            ->where('id', '!=', $incoming->id)
            ->where('news_source_id', $incoming->news_source_id)
            ->whereIn('status', [
                IncomingNewsStatus::SANITIZED,
                IncomingNewsStatus::VALIDATED,
            ])
            ->whereDoesntHave('article')
            ->whereNull('merged_into_article_id')
            ->whereNull('merged_into_incoming_news_id')
            ->where('created_at', '>=', $workflowSince)
            ->latest('id')
            ->limit($candidateLimit)
            ->get(['id', 'title', 'summary', 'source_content', 'sanitized_payload']);

        foreach ($incomings as $candidate) {
            $payload = is_array($candidate->sanitized_payload) ? $candidate->sanitized_payload : [];
            $score = $this->similarityScore(
                $targetTokens,
                $this->normalizeText(trim(
                    (string) ($payload['title'] ?? $candidate->title).' '
                    .(string) ($payload['summary'] ?? $candidate->summary).' '
                    .Str::limit((string) ($payload['content'] ?? $candidate->source_content ?? ''), 900, '')
                ))
            );

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestArticleId = null;
                $bestIncomingId = $candidate->id;
            }
        }

        if ($bestScore < $threshold) {
            return null;
        }

        return [
            'score' => round($bestScore, 4),
            'article_id' => $bestArticleId,
            'incoming_id' => $bestIncomingId,
        ];
    }

    private function isDifferentSource(
        IncomingNews $incoming,
        ?int $candidateSourceId,
        string $candidateSourceName = ''
    ): bool {
        if ($candidateSourceId !== null && (int) $candidateSourceId === (int) $incoming->news_source_id) {
            return false;
        }

        $incomingSourceName = mb_strtolower(trim((string) ($incoming->source?->name ?? '')));
        $candidateName = mb_strtolower(trim($candidateSourceName));

        if ($incomingSourceName !== '' && $candidateName !== '' && $incomingSourceName === $candidateName) {
            return false;
        }

        return true;
    }

    /**
     * @param  array<int, string>  $targetTokens
     */
    private function similarityScore(array $targetTokens, string $candidateText): float
    {
        $candidateTokens = $this->tokens($candidateText);
        if ($candidateTokens === []) {
            return 0.0;
        }

        return $this->jaccardSimilarity($targetTokens, $candidateTokens);
    }

    /**
     * @template T
     * @param  iterable<T>  $candidates
     * @param  callable(T): string  $textResolver
     * @param  (callable(T): bool)|null  $acceptCandidate
     * @param  array<int, string>  $targetTokens
     * @return array{id: int, score: float}|null
     */
    private function bestSimilarityMatch(
        array $targetTokens,
        iterable $candidates,
        float $threshold,
        callable $textResolver,
        ?callable $acceptCandidate = null
    ): ?array {
        $bestScore = 0.0;
        $bestId = null;

        foreach ($candidates as $candidate) {
            if ($acceptCandidate !== null && ! $acceptCandidate($candidate)) {
                continue;
            }

            $score = $this->similarityScore($targetTokens, $textResolver($candidate));
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestId = (int) $candidate->id;
            }
        }

        if ($bestId === null || $bestScore < $threshold) {
            return null;
        }

        return [
            'id' => $bestId,
            'score' => round($bestScore, 4),
        ];
    }

    private function duplicateResult(
        string $type,
        string $reason,
        float $score,
        ?int $articleId,
        ?int $incomingId,
        string $action
    ): array {
        return [
            'is_duplicate' => true,
            'action' => $action,
            'type' => $type,
            'matched_article_id' => $articleId,
            'matched_incoming_news_id' => $incomingId,
            'score' => $score,
            'reason' => $reason,
        ];
    }

    /**
     * @return array{
     *     is_duplicate: false,
     *     action: 'none',
     *     type: null,
     *     matched_article_id: null,
     *     matched_incoming_news_id: null,
     *     score: null,
     *     reason: string
     * }
     */
    private function notDuplicate(string $reason): array
    {
        return [
            'is_duplicate' => false,
            'action' => 'none',
            'type' => null,
            'matched_article_id' => null,
            'matched_incoming_news_id' => null,
            'score' => null,
            'reason' => $reason,
        ];
    }

    private function normalizeText(string $text): string
    {
        $text = mb_strtolower($text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text) ?? $text;
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;

        return trim($text);
    }

    /**
     * @return array<int, string>
     */
    private function tokens(string $text): array
    {
        $parts = preg_split('/\s+/u', $text) ?: [];
        $stopWords = $this->stopWords();
        $filtered = [];

        foreach ($parts as $part) {
            $term = trim($part);
            if ($term === '' || mb_strlen($term) < 3) {
                continue;
            }
            if (isset($stopWords[$term])) {
                continue;
            }
            $filtered[$term] = true;
        }

        return array_keys($filtered);
    }

    /**
     * @param  array<int, string>  $a
     * @param  array<int, string>  $b
     */
    private function jaccardSimilarity(array $a, array $b): float
    {
        $setA = array_fill_keys($a, true);
        $setB = array_fill_keys($b, true);

        $intersection = array_intersect_key($setA, $setB);
        $union = $setA + $setB;
        if ($union === []) {
            return 0.0;
        }

        return count($intersection) / count($union);
    }

    /**
     * @return array<string, true>
     */
    private function stopWords(): array
    {
        static $words = null;
        if ($words !== null) {
            return $words;
        }

        $list = [
            'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'has', 'had', 'are', 'was',
            'not', 'will', 'would', 'could', 'should', 'into', 'about', 'after', 'before', 'between',
            'una', 'uno', 'degli', 'della', 'delle', 'dello', 'dall', 'agli', 'alle', 'dopo', 'prima',
            'come', 'quale', 'quali', 'quando', 'dove', 'dalla', 'dallo', 'sono', 'sulla', 'sullo',
            'nel', 'nella', 'nelle', 'dati', 'dato', 'anche', 'perche', 'mentre', 'verso', 'sotto',
            'news', 'report', 'reports', 'update', 'breaking', 'fonte', 'source', 'article',
        ];

        $words = [];
        foreach ($list as $word) {
            $words[$word] = true;
        }

        return $words;
    }
}
