<?php

namespace App\Services;

use App\Models\Article;
use App\Models\IncomingNews;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class NewsDuplicateDetectionService
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{is_duplicate: bool, type: string|null, matched_article_id: int|null, score: float|null, reason: string}
     */
    public function detect(IncomingNews $incoming, array $payload): array
    {
        $enabled = (bool) config('ai_news.deduplication.enabled', true);
        if (! $enabled) {
            return $this->notDuplicate('deduplication_disabled');
        }

        $title = (string) ($payload['title'] ?? $incoming->title ?? '');
        $summary = (string) ($payload['summary'] ?? $incoming->summary ?? '');
        $content = (string) ($payload['content'] ?? $incoming->source_content ?? '');
        $sourceUrl = trim((string) ($payload['source_url'] ?? $incoming->url ?? ''));

        if ($sourceUrl !== '') {
            $exactByUrl = Article::query()
                ->where('source_url', $sourceUrl)
                ->latest('id')
                ->first();
            if ($exactByUrl) {
                return [
                    'is_duplicate' => true,
                    'type' => 'exact_url',
                    'matched_article_id' => $exactByUrl->id,
                    'score' => 1.0,
                    'reason' => 'duplicate_exact_url',
                ];
            }
        }

        $normalizedTitle = $this->normalizeText($title);
        if ($normalizedTitle !== '') {
            $exactByTitle = Article::query()
                ->whereRaw('LOWER(title) = ?', [mb_strtolower($title)])
                ->latest('id')
                ->first();
            if ($exactByTitle) {
                return [
                    'is_duplicate' => true,
                    'type' => 'exact_title',
                    'matched_article_id' => $exactByTitle->id,
                    'score' => 1.0,
                    'reason' => 'duplicate_exact_title',
                ];
            }
        }

        $targetText = $this->normalizeText(trim($title.' '.$summary.' '.Str::limit($content, 1200, '')));
        $targetTokens = $this->tokens($targetText);
        if ($targetTokens === []) {
            return $this->notDuplicate('dedupe_insufficient_text');
        }

        $lookbackDays = max(1, (int) config('ai_news.deduplication.lookback_days', 14));
        $candidateLimit = max(10, (int) config('ai_news.deduplication.candidate_limit', 80));
        $threshold = (float) config('ai_news.deduplication.similarity_threshold', 0.72);
        $since = Carbon::now()->subDays($lookbackDays);

        $candidates = Article::query()
            ->where(function ($q): void {
                $q->where('created_by', 'ai')
                    ->orWhere('status', 'published');
            })
            ->where('created_at', '>=', $since)
            ->latest('id')
            ->limit($candidateLimit)
            ->get(['id', 'title', 'summary', 'content', 'topic']);

        $bestScore = 0.0;
        $bestArticleId = null;

        foreach ($candidates as $candidate) {
            $candidateText = $this->normalizeText(trim(
                (string) $candidate->title.' '.(string) $candidate->summary.' '.Str::limit((string) $candidate->content, 900, '')
            ));
            $candidateTokens = $this->tokens($candidateText);
            if ($candidateTokens === []) {
                continue;
            }

            $score = $this->jaccardSimilarity($targetTokens, $candidateTokens);
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestArticleId = (int) $candidate->id;
            }
        }

        if ($bestArticleId !== null && $bestScore >= $threshold) {
            return [
                'is_duplicate' => true,
                'type' => 'similar_context',
                'matched_article_id' => $bestArticleId,
                'score' => round($bestScore, 4),
                'reason' => 'duplicate_similar_context',
            ];
        }

        return $this->notDuplicate('not_duplicate');
    }

    /**
     * @return array{is_duplicate: bool, type: null, matched_article_id: null, score: null, reason: string}
     */
    private function notDuplicate(string $reason): array
    {
        return [
            'is_duplicate' => false,
            'type' => null,
            'matched_article_id' => null,
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

