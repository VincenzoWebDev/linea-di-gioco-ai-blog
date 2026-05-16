<?php

namespace App\Services;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GeopoliticalTensionService
{
    private const HEADER_CACHE_KEY = 'geopolitical_tensions.header_top_5';

    public function __construct(
        private readonly RegionCoordinateResolver $coordinateResolver,
        private readonly RiskScoreCalibrationService $riskScoreCalibration
    ) {
    }

    /**
     * @param array<string, mixed> $agentOutput
     */
    public function upsertFromAgentOutput(array $agentOutput, ?Article $featuredArticle = null): ?GeopoliticalTension
    {
        if (! Schema::hasTable('geopolitical_tensions')) {
            return null;
        }

        $payload = $this->extractTensionPayload($agentOutput);
        if ($payload === null) {
            return null;
        }

        $regionName = trim((string) ($payload['region_name'] ?? ''));
        if ($regionName === '') {
            return null;
        }

        $statusLabel = trim((string) ($payload['status_label'] ?? ''));
        $context = $this->articleContext($featuredArticle);
        $rawRisk = $this->normalizeRiskScore($payload['risk_score'] ?? 0);
        $riskScore = $this->riskScoreCalibration->calibrate($rawRisk, $context, $statusLabel);
        $trendDirection = $this->normalizeTrendDirection($payload['trend_direction'] ?? 'stable');
        $coordinates = $this->coordinateResolver->resolve($regionName, $context);

        $attributes = [
            'risk_score' => $riskScore,
            'trend_direction' => $trendDirection,
            'status_label' => Str::limit($statusLabel !== '' ? $statusLabel : 'Tensione geopolitica', 255, ''),
            'featured_article_id' => $featuredArticle?->id,
            'updated_at' => now(),
            'latitude' => $coordinates['lat'] ?? null,
            'longitude' => $coordinates['long'] ?? null,
        ];

        $tension = GeopoliticalTension::query()->updateOrCreate(
            ['region_name' => Str::limit($regionName, 255, '')],
            $attributes
        );

        $this->clearHeaderCache();

        return $tension;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function topForHeader(int $limit = 5): Collection
    {
        if (! Schema::hasTable('geopolitical_tensions')) {
            return collect();
        }

        if ($limit !== 5) {
            return $this->queryTopForHeader($limit);
        }

        return collect(Cache::remember(
            self::HEADER_CACHE_KEY,
            now()->addMinutes(1),
            fn () => $this->queryTopForHeader(5)->all()
        ));
    }

    public function clearHeaderCache(): void
    {
        Cache::forget(self::HEADER_CACHE_KEY);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function queryTopForHeader(int $limit): Collection
    {
        return GeopoliticalTension::query()
            ->with('featuredArticle:id,title,slug,status')
            ->orderByDesc('risk_score')
            ->orderBy('region_name')
            ->limit($limit)
            ->get()
            ->map(fn (GeopoliticalTension $tension) => [
                'region_name' => $tension->region_name,
                'risk_score' => $tension->risk_score,
                'trend_direction' => $tension->trend_direction,
                'status_label' => $tension->status_label,
                'status_color' => $tension->getStatusColor(),
                'article_url' => $this->articleUrl($tension),
            ])
            ->values();
    }

    /**
     * @param array<string, mixed> $agentOutput
     * @return array<string, mixed>|null
     */
    private function extractTensionPayload(array $agentOutput): ?array
    {
        $payload = $agentOutput['geopolitical_tension'] ?? $agentOutput;

        return is_array($payload) ? $payload : null;
    }

    private function normalizeRiskScore(mixed $value): int
    {
        $score = is_numeric($value) ? (int) $value : 0;

        return max(0, min(100, $score));
    }

    private function normalizeTrendDirection(mixed $value): string
    {
        $trend = strtolower(trim((string) $value));

        return in_array($trend, ['rising', 'falling', 'stable'], true) ? $trend : 'stable';
    }

    private function articleContext(?Article $article): string
    {
        if (! $article) {
            return '';
        }

        return trim(implode(' ', array_filter([
            $article->title,
            $article->summary,
            $article->content ? Str::limit(strip_tags($article->content), 600, '') : null,
        ])));
    }

    private function articleUrl(GeopoliticalTension $tension): ?string
    {
        $article = $tension->featuredArticle;
        if (! $article || $article->status !== 'published') {
            return null;
        }

        return route('blog.articles.show', [
            'id' => $article->id,
            'slug' => $article->slug,
        ]);
    }
}
