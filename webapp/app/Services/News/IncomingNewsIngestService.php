<?php

namespace App\Services\News;

use App\Enums\IncomingNewsStatus;
use App\Models\AgentRun;
use App\Models\IncomingNews;
use App\Models\NewsSource;
use App\Services\ArticleValidationService;
use App\Support\ArticleContentNormalizer;
use Illuminate\Support\Carbon;

class IncomingNewsIngestService
{
    public function __construct(
        private readonly ArticleValidationService $validationService,
        private readonly NewsPipelineOrchestrator $pipeline
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function ingest(array $payload, string $idempotencyKey): ?IncomingNews
    {
        $sourceName = trim((string) ($payload['source_name'] ?? 'CrewAI Dispatch'));
        $sourceUrl = trim((string) ($payload['source_url'] ?? 'https://dispatch.local'));

        $source = NewsSource::query()->firstOrCreate(
            ['name' => $sourceName],
            [
                'type' => 'api',
                'endpoint' => $sourceUrl,
                'is_active' => true,
                'poll_interval_minutes' => 60,
            ]
        );

        $sanitizedPayload = $this->buildSanitizedPayload($payload, $sourceUrl);
        $rewriteMode = (string) ($sanitizedPayload['rewrite_mode'] ?? 'dispatch');
        $requiresItalianRewrite = $rewriteMode !== 'crewai'
            && $this->validationService->needsItalianRewrite($sanitizedPayload);

        $publishedAt = isset($payload['published_at'])
            ? Carbon::parse((string) $payload['published_at'])
            : now();

        $incoming = IncomingNews::query()->firstOrCreate(
            ['fingerprint' => $idempotencyKey],
            [
                'news_source_id' => $source->id,
                'external_id' => (string) ($payload['external_id'] ?? ''),
                'url' => $sourceUrl,
                'title' => (string) ($payload['title'] ?? ''),
                'summary' => (string) ($payload['summary'] ?? null),
                'source_content' => (string) ($payload['content'] ?? ''),
                'raw_payload' => $payload,
                'sanitized_payload' => $sanitizedPayload,
                'published_at' => $publishedAt,
                'sanitized_at' => $requiresItalianRewrite ? null : now(),
                'status' => $requiresItalianRewrite ? IncomingNewsStatus::QUEUED : IncomingNewsStatus::SANITIZED,
                'quality_score' => (float) ($sanitizedPayload['quality_score'] ?? 0),
            ]
        );

        if (! $incoming->wasRecentlyCreated) {
            return null;
        }

        AgentRun::query()->create([
            'incoming_news_id' => $incoming->id,
            'agent_name' => 'DispatchAgent',
            'prompt_version' => 'dispatch-v2',
            'status' => 'success',
            'result_payload' => [
                'rewrite_mode' => $sanitizedPayload['rewrite_mode'],
                'idempotency_key' => $idempotencyKey,
            ],
        ]);

        $this->pipeline->advance($incoming);

        return $incoming;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function buildSanitizedPayload(array $payload, string $sourceUrl): array
    {
        $providedScore = (float) ($payload['quality_score'] ?? 0);
        $computedScore = $this->computeQualityScore(
            (string) ($payload['title'] ?? ''),
            (string) ($payload['content'] ?? ''),
            (string) ($payload['topic'] ?? 'geopolitica'),
            $sourceUrl
        );

        $result = [
            'title' => (string) ($payload['title'] ?? ''),
            'summary' => (string) ($payload['summary'] ?? ''),
            'content' => ArticleContentNormalizer::stripSourceFooter((string) ($payload['content'] ?? '')),
            'topic' => (string) ($payload['topic'] ?? 'geopolitica'),
            'categories' => ArticleContentNormalizer::normalizeCategories($payload['categories'] ?? []),
            'quality_score' => max($providedScore, $computedScore),
            'source_url' => $sourceUrl,
            'rewrite_mode' => (string) ($payload['rewrite_mode'] ?? 'dispatch'),
            'language' => (string) ($payload['language'] ?? 'it'),
        ];

        if (is_array($payload['geopolitical_tension'] ?? null)) {
            $result['geopolitical_tension'] = $payload['geopolitical_tension'];
        }

        return $result;
    }

    private function computeQualityScore(string $title, string $content, string $topic, string $sourceUrl): float
    {
        $score = 35.0;

        $titleLen = mb_strlen(trim($title));
        if ($titleLen >= 24) {
            $score += 15;
        } elseif ($titleLen >= 14) {
            $score += 8;
        }

        $contentLen = mb_strlen(trim($content));
        if ($contentLen >= 1200) {
            $score += 25;
        } elseif ($contentLen >= 700) {
            $score += 20;
        } elseif ($contentLen >= 350) {
            $score += 12;
        }

        $lowerContent = mb_strtolower($content);
        $lowerTopic = mb_strtolower($topic);
        if (
            str_contains($lowerTopic, 'geopolit')
            || str_contains($lowerContent, 'nato')
            || str_contains($lowerContent, 'diplom')
            || str_contains($lowerContent, 'sanzion')
            || str_contains($lowerContent, 'conflict')
            || str_contains($lowerContent, 'war')
        ) {
            $score += 10;
        }

        if (filter_var($sourceUrl, FILTER_VALIDATE_URL)) {
            $score += 5;
        }

        return min($score, 100.0);
    }
}
