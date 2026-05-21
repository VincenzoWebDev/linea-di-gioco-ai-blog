<?php

namespace App\Services;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Support\GeopoliticalSeverity;
use App\Support\ThermalDecay;
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

        $rawRegionName = trim((string) ($payload['region_name'] ?? ''));
        $context = $this->articleContext($featuredArticle);
        $regionName = $this->normalizeRegionName($rawRegionName, $featuredArticle);
        if ($regionName === '') {
            return null;
        }

        $statusLabel = trim((string) ($payload['status_label'] ?? ''));
        $rawRisk = $this->normalizeRiskScore($payload['risk_score'] ?? 0);
        $riskScore = $this->riskScoreCalibration->calibrate($rawRisk, $context, $statusLabel);
        $trendDirection = $this->normalizeTrendDirection($payload['trend_direction'] ?? 'stable');
        $coordinates = $this->resolveCoordinates($regionName, $featuredArticle);

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
     * @return array{
     *     initial_risk_score: int,
     *     current_tension: int,
     *     silence_hours: int,
     *     decay_days: int,
     *     radio_silence_label: string
     * }
     */
    public function decaySnapshot(GeopoliticalTension $tension): array
    {
        return ThermalDecay::snapshot(
            (int) $tension->risk_score,
            $tension->updated_at,
        );
    }

    public function normalizeRegionName(string $regionName, ?Article $article = null): string
    {
        $regionName = trim($regionName);
        $context = $this->articleContext($article);
        $canonical = $this->coordinateResolver->canonicalRegionName($regionName, $context);

        if ($canonical !== null && $canonical !== '') {
            return Str::limit($canonical, 255, '');
        }

        if ($regionName !== '') {
            return Str::limit($regionName, 255, '');
        }

        $fallback = $article ? $this->coordinateResolver->canonicalRegionName('', $context) : null;

        return Str::limit((string) ($fallback ?: ''), 255, '');
    }

    /**
     * Risolve e salva coordinate mancanti (es. regione generica + titolo articolo con "turca").
     */
    public function backfillMapCoordinates(): int
    {
        if (! Schema::hasTable('geopolitical_tensions')) {
            return 0;
        }

        $updated = 0;

        GeopoliticalTension::query()
            ->with('featuredArticle:id,title,summary,content')
            ->orderBy('id')
            ->chunkById(50, function ($tensions) use (&$updated): void {
                foreach ($tensions as $tension) {
                    if ($tension->hasMapCoordinates()) {
                        continue;
                    }

                    $coordinates = $this->resolveCoordinates(
                        (string) $tension->region_name,
                        $tension->featuredArticle
                    );
                    $regionName = $this->normalizeRegionName((string) $tension->region_name, $tension->featuredArticle);

                    if ($coordinates === null) {
                        continue;
                    }

                    $tension->update([
                        'region_name' => $regionName !== '' ? $regionName : $tension->region_name,
                        'latitude' => $coordinates['lat'],
                        'longitude' => $coordinates['long'],
                    ]);
                    $updated++;
                }
            });

        if ($updated > 0) {
            $this->clearHeaderCache();
        }

        return $updated;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function queryTopForHeader(int $limit): Collection
    {
        return GeopoliticalTension::query()
            ->with('featuredArticle:id,title,slug,status')
            ->get()
            ->map(function (GeopoliticalTension $tension) {
                $decay = $this->decaySnapshot($tension);
                $regionName = $this->normalizeRegionName((string) $tension->region_name, $tension->featuredArticle);

                return [
                    'region_name' => $regionName !== '' ? $regionName : $tension->region_name,
                    'risk_score' => $decay['current_tension'],
                    'initial_risk_score' => $decay['initial_risk_score'],
                    'current_tension' => $decay['current_tension'],
                    'trend_direction' => $tension->trend_direction,
                    'status_label' => $tension->status_label,
                    'status_color' => $this->statusColorForScore($decay['current_tension']),
                    'silence_hours' => $decay['silence_hours'],
                    'radio_silence_label' => $decay['radio_silence_label'],
                    'severity' => GeopoliticalSeverity::fromRiskScore($decay['current_tension']),
                    'article_url' => $this->articleUrl($tension),
                ];
            })
            ->filter(fn (array $tension) => $tension['current_tension'] > 0)
            ->sortBy([
                ['current_tension', 'desc'],
                ['region_name', 'asc'],
            ])
            ->take($limit)
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

    private function articleHeadlineContext(?Article $article): string
    {
        if (! $article) {
            return '';
        }

        return trim(implode(' ', array_filter([
            $article->title,
            $article->summary,
        ])));
    }

    /**
     * @return array{lat: float, long: float}|null
     */
    public function resolveCoordinates(string $regionName, ?Article $article): ?array
    {
        if ($article) {
            $title = trim((string) $article->title);
            if ($title !== '') {
                $fromTitle = $this->coordinateResolver->resolve($regionName, $title);
                if ($fromTitle !== null) {
                    return $fromTitle;
                }
            }
        }

        $headlineContext = $this->articleHeadlineContext($article);
        $fromHeadline = $headlineContext !== ''
            ? $this->coordinateResolver->resolve($regionName, $headlineContext)
            : null;
        if ($fromHeadline !== null) {
            return $fromHeadline;
        }

        $fullContext = $this->articleContext($article);

        return $fullContext !== '' && $fullContext !== $headlineContext
            ? $this->coordinateResolver->resolve($regionName, $fullContext)
            : null;
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

    private function statusColorForScore(int $score): string
    {
        return match (true) {
            $score >= (int) config('ai_news.risk.severity_high', 80) => 'text-red-600',
            $score >= (int) config('ai_news.risk.severity_elevated', 60) => 'text-orange-600',
            $score >= (int) config('ai_news.risk.severity_guarded', 40) => 'text-yellow-600',
            default => 'text-green-600',
        };
    }
}
