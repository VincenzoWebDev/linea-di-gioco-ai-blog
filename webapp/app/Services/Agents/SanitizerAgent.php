<?php

namespace App\Services\Agents;

use App\Services\AiArticleWriter;
use App\Services\ArticleValidationService;
use App\Services\CrewAiClient;
use App\Support\ArticleContentNormalizer;
use Illuminate\Support\Str;

class SanitizerAgent
{
    public function __construct(
        private readonly AiArticleWriter $aiArticleWriter,
        private readonly CrewAiClient $crewAiClient,
        private readonly ArticleValidationService $articleValidationService
    ) {
    }

    /**
     * @param  array<string, mixed>  $rawNews
     * @return array<string, mixed>
     */
    public function sanitize(array $rawNews): array
    {
        $title = trim((string) ($rawNews['title'] ?? 'Senza titolo'));
        $summary = trim((string) ($rawNews['summary'] ?? ''));
        $sourceUrl = trim((string) ($rawNews['url'] ?? $rawNews['source_url'] ?? ''));
        $sourceContent = trim((string) ($rawNews['source_content'] ?? ''));

        $safeTitle = Str::limit(strip_tags($title), 140, '');
        $safeSummary = Str::limit(strip_tags($summary), 240, '');

        $baseText = $sourceContent !== '' ? strip_tags($sourceContent) : $safeSummary;
        $baseText = trim(preg_replace('/\s+/', ' ', $baseText) ?? '');

        $intro = Str::limit($baseText, 280, '');
        $development = Str::limit(Str::after($baseText, $intro), 900, '');
        $body = trim($intro."\n\n".$development);
        $finalSummary = $safeSummary !== '' ? $safeSummary : Str::limit($intro, 220, '');

        $crewOutput = $this->crewAiClient->process([
            'title' => $safeTitle,
            'summary' => $safeSummary,
            'source_content' => $sourceContent !== '' ? $sourceContent : $baseText,
            'source_url' => $sourceUrl,
        ]);

        if (is_array($crewOutput)) {
            $crewTitle = (string) ($crewOutput['title'] ?? $safeTitle);
            $crewContent = ArticleContentNormalizer::stripSourceFooter((string) ($crewOutput['content'] ?? $body));
            $crewScore = (float) ($crewOutput['quality_score'] ?? 0);
            if ($crewScore <= 0) {
                $crewScore = $this->qualityScore($crewTitle, $crewContent);
            }

            $crewCandidate = [
                'title' => $crewTitle,
                'summary' => (string) ($crewOutput['summary'] ?? $finalSummary),
                'content' => $crewContent,
                'topic' => (string) ($crewOutput['topic'] ?? 'geopolitica'),
                'categories' => ArticleContentNormalizer::normalizeCategories(
                    $crewOutput['categories'] ?? [($crewOutput['topic'] ?? 'geopolitica')]
                ),
                'quality_score' => $crewScore,
                'source_url' => ArticleContentNormalizer::preferNonEmptyString($crewOutput['source_url'] ?? null, $sourceUrl),
                'rewrite_mode' => 'crewai',
                'language' => 'it',
            ];
            if (is_array($crewOutput['geopolitical_tension'] ?? null)) {
                $crewCandidate['geopolitical_tension'] = $crewOutput['geopolitical_tension'];
            }

            if ($this->articleValidationService->validateContentPolicy($crewCandidate)['valid']) {
                return $crewCandidate;
            }
        }

        $aiOutput = $this->aiArticleWriter->rewriteToItalian([
            'title' => $safeTitle,
            'summary' => $safeSummary,
            'source_content' => $sourceContent !== '' ? $sourceContent : $baseText,
            'source_url' => $sourceUrl,
        ]);

        if (is_array($aiOutput)) {
            $aiBody = ArticleContentNormalizer::stripSourceFooter(trim((string) ($aiOutput['content'] ?? '')));

            $aiCandidate = [
                'title' => (string) ($aiOutput['title'] ?? $safeTitle),
                'summary' => (string) ($aiOutput['summary'] ?? $finalSummary),
                'content' => $aiBody,
                'topic' => (string) ($aiOutput['topic'] ?? 'news'),
                'categories' => ArticleContentNormalizer::normalizeCategories(
                    $aiOutput['categories'] ?? [($aiOutput['topic'] ?? 'news')]
                ),
                'quality_score' => $this->qualityScore((string) ($aiOutput['title'] ?? $safeTitle), $aiBody),
                'source_url' => $sourceUrl,
                'rewrite_mode' => 'ai',
                'language' => 'it',
            ];

            if ($this->articleValidationService->validateContentPolicy($aiCandidate)['valid']) {
                return $aiCandidate;
            }
        }

        return [
            'title' => $safeTitle,
            'summary' => $finalSummary,
            'content' => $body,
            'topic' => 'news',
            'categories' => ['news'],
            'quality_score' => $this->qualityScore($safeTitle, $body),
            'source_url' => $sourceUrl,
            'rewrite_mode' => 'fallback',
            'language' => 'und',
        ];
    }

    private function qualityScore(string $title, string $content): float
    {
        $score = 60.0;

        if (Str::length($title) >= 18) {
            $score += 15;
        }

        if (Str::length($content) >= 80) {
            $score += 15;
        }

        return min($score, 100.0);
    }
}
