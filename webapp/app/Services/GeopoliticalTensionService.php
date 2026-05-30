<?php

namespace App\Services;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Support\GeopoliticalSeverity;
use App\Support\ThermalDecay;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GeopoliticalTensionService
{
    private const HEADER_CACHE_KEY = 'geopolitical_tensions.header_top_5';

    public function __construct(
        private readonly RegionCoordinateResolver $coordinateResolver,
        private readonly RiskScoreCalibrationService $riskScoreCalibration,
        private readonly GeopoliticalEventWeightService $eventWeightService
    ) {}

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

        $coordinates = $this->resolveCoordinates($regionName, $featuredArticle);
        $existingTension = $this->findExistingTension(
            Str::limit($regionName, 255, ''),
            $coordinates
        );

        $statusLabel = trim((string) ($payload['status_label'] ?? ''));
        $rawRisk = $this->normalizeRiskScore($payload['risk_score'] ?? 0);
        $agentTrend = $this->normalizeTrendDirection($payload['trend_direction'] ?? 'stable');
        $calibratedRiskScore = $this->riskScoreCalibration->calibrate($rawRisk, $context, $statusLabel, $agentTrend);
        $currentRiskScore = $existingTension?->risk_score ?? 0;
        $eventDelta = $this->eventWeightService->delta($calibratedRiskScore, $agentTrend, $context, $statusLabel);
        $shouldTriggerEventTime = $eventDelta >= 3;
        $riskScore = max(0, min(100, $currentRiskScore + $eventDelta));
        // $trendDirection = $this->scoreTrendDirection($currentRiskScore, $riskScore, $agentTrend);
        $decayedRiskScore = $existingTension
            ? (int) $this->decaySnapshot($existingTension)['current_tension']
            : $currentRiskScore;
        $trendDirection = $this->scoreTrendDirection(
            $decayedRiskScore,
            $riskScore,
            $agentTrend
        );
        $coordinates = $this->resolveCoordinates($regionName, $featuredArticle);

        $attributes = [
            'region_name' => Str::limit($regionName, 255, ''),
            'risk_score' => $riskScore,
            'event_delta' => $eventDelta,
            'previous_current_tension' => $currentRiskScore,
            'trend_direction' => $trendDirection,
            'status_label' => Str::limit($statusLabel !== '' ? $statusLabel : 'Tensione geopolitica', 255, ''),
            'featured_article_id' => $featuredArticle?->id,
            // 'last_event_at' => now(),
            'last_event_at' => $shouldTriggerEventTime
                ? now()
                : ($existingTension->last_event_at ?? now()),
            'last_decay_at' => null,
            'updated_at' => now(),
            'latitude' => $coordinates['lat'] ?? null,
            'longitude' => $coordinates['long'] ?? null,
        ];

        $tension = $this->persistTension($existingTension, $attributes, $featuredArticle);

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
            fn() => $this->queryTopForHeader(5)->all()
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
     *     decay_model: string,
     *     decay_percent_per_day: float,
     *     radio_silence_label: string
     * }
     */
    public function decaySnapshot(GeopoliticalTension $tension): array
    {
        return ThermalDecay::snapshot(
            (int) $tension->risk_score,
            $tension->last_event_at ?? $tension->updated_at,
            null,
            $tension->last_decay_at,
        );
    }

    public function coolTensions(): int
    {
        if (! Schema::hasTable('geopolitical_tensions')) {
            return 0;
        }

        $updated = 0;

        GeopoliticalTension::query()
            ->orderBy('id')
            ->chunkById(100, function ($tensions) use (&$updated): void {
                foreach ($tensions as $tension) {
                    $snapshot = $this->decaySnapshot($tension);
                    $current = (int) $snapshot['current_tension'];

                    if ($current === (int) $tension->risk_score) {
                        continue;
                    }

                    DB::table('geopolitical_tensions')
                        ->where('id', $tension->id)
                        ->update([
                            'risk_score' => $current,
                            'trend_direction' => 'falling',
                            'last_decay_at' => now(),
                            'updated_at' => now(),
                        ]);

                    $updated++;
                }
            });

        if ($updated > 0) {
            $this->clearHeaderCache();
        }

        return $updated;
    }

    public function resolveTrendDirection(GeopoliticalTension $tension): string
    {
        $currentTension = (int) ($this->decaySnapshot($tension)['current_tension'] ?? $tension->risk_score ?? 0);

        if ($currentTension < (int) $tension->risk_score) {
            return 'falling';
        }

        return $this->normalizeTrendDirection($tension->trend_direction);
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
            ->filter(fn(array $tension) => $tension['current_tension'] > 0)
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

    private function scoreTrendDirection(mixed $previousScore, int $currentScore, string $agentTrend): string
    {
        if (! is_numeric($previousScore)) {
            return $agentTrend;
        }

        $previous = (int) $previousScore;

        return match (true) {
            $currentScore > $previous => 'rising',
            $currentScore < $previous => 'falling',
            default => 'stable',
        };
    }

    private function findExistingTension(string $regionName, ?array $coordinates): ?GeopoliticalTension
    {
        $byName = GeopoliticalTension::query()
            ->where('region_name', $regionName)
            ->first();

        if ($byName !== null) {
            return $byName;
        }

        if ($coordinates === null) {
            return null;
        }

        return GeopoliticalTension::query()
            ->where('latitude', $coordinates['lat'])
            ->where('longitude', $coordinates['long'])
            ->first();
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

    private function persistTension(?GeopoliticalTension $existingTension, array $attributes, ?Article $featuredArticle): GeopoliticalTension
    {
        if ($existingTension !== null) {
            return $this->updateExistingTension($existingTension, $attributes, $featuredArticle);
        }

        try {
            return GeopoliticalTension::query()->create($this->storedTensionAttributes($attributes));
        } catch (QueryException $e) {
            if (! $this->isDuplicateRegionException($e)) {
                throw $e;
            }

            $current = GeopoliticalTension::query()
                ->where('region_name', $attributes['region_name'])
                ->first();

            if ($current === null) {
                throw $e;
            }

            return $this->updateExistingTension($current, $attributes, $featuredArticle);
        }
    }

    private function updateExistingTension(GeopoliticalTension $existingTension, array $attributes, ?Article $featuredArticle): GeopoliticalTension
    {
        $incomingRisk = (int) $attributes['risk_score'];
        $currentRisk = (int) ($attributes['previous_current_tension'] ?? $existingTension->risk_score);
        $eventDelta = (int) ($attributes['event_delta'] ?? 0);
        $shouldPromote = $incomingRisk > $currentRisk;
        $shouldDecompress = $eventDelta < 0 && $incomingRisk < $currentRisk;

        $updates = [
            'region_name' => $this->preferredRegionName(
                (string) $existingTension->region_name,
                (string) $attributes['region_name']
            ),
            'latitude' => $existingTension->latitude ?? $attributes['latitude'],
            'longitude' => $existingTension->longitude ?? $attributes['longitude'],
        ];

        if ($shouldPromote || $shouldDecompress || $featuredArticle?->id === $existingTension->featured_article_id) {
            $updates['risk_score'] = $incomingRisk;
            $updates['trend_direction'] = (string) $attributes['trend_direction'];
            $updates['status_label'] = (string) $attributes['status_label'];
            $updates['featured_article_id'] = $attributes['featured_article_id'];
            $updates['latitude'] = $attributes['latitude'] ?? $updates['latitude'];
            $updates['longitude'] = $attributes['longitude'] ?? $updates['longitude'];
        }

        $updates['last_event_at'] = $attributes['last_event_at'];
        $updates['last_decay_at'] = $attributes['last_decay_at'];
        $updates['updated_at'] = $attributes['updated_at'];

        $existingTension->update($updates);

        return $existingTension->fresh() ?? $existingTension;
    }

    /**
     * @param array<string, mixed> $attributes
     * @return array<string, mixed>
     */
    private function storedTensionAttributes(array $attributes): array
    {
        unset($attributes['event_delta'], $attributes['previous_current_tension']);

        return $attributes;
    }

    private function preferredRegionName(string $currentRegion, string $incomingRegion): string
    {
        $currentRegion = trim($currentRegion);
        $incomingRegion = trim($incomingRegion);

        if ($currentRegion === '') {
            return $incomingRegion;
        }

        if ($incomingRegion === '') {
            return $currentRegion;
        }

        $canonicalCurrent = $this->coordinateResolver->canonicalRegionName($currentRegion) ?? $currentRegion;
        if ($canonicalCurrent !== $currentRegion && $canonicalCurrent === $incomingRegion) {
            return $incomingRegion;
        }

        if ($this->coordinateResolver->isGenericRegionName($currentRegion) && ! $this->coordinateResolver->isGenericRegionName($incomingRegion)) {
            return $incomingRegion;
        }

        if (
            ! $this->coordinateResolver->isGenericRegionName($incomingRegion)
            && mb_strlen($incomingRegion) > mb_strlen($currentRegion) + 3
        ) {
            return $incomingRegion;
        }

        return $currentRegion;
    }

    private function isDuplicateRegionException(QueryException $e): bool
    {
        $message = mb_strtolower($e->getMessage());

        return str_contains($message, 'duplicate')
            || str_contains($message, 'unique')
            || str_contains($message, '1062');
    }
}
