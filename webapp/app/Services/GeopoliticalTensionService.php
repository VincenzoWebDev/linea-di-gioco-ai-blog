<?php

namespace App\Services;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Support\GeopoliticalSeverity;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GeopoliticalTensionService
{
    private const HEADER_CACHE_KEY = 'geopolitical_tensions.header_top_5';

    private const DEFAULT_TTL_HOURS = 48;

    private const DEFAULT_MIN_ACTIVE_RISK_SCORE = 30;

    public function __construct(
        private readonly RegionCoordinateResolver $coordinateResolver,
        private readonly GeopoliticalAreaExtractionService $areaExtractionService,
        private readonly RiskScoreCalibrationService $riskScoreCalibration
    ) {}

    /**
     * @param  array<string, mixed>  $agentOutput
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

        $area = $this->areaExtractionService->extractFromArticle($featuredArticle, $payload);
        $rawRegionName = trim((string) ($area['region_name'] ?? $payload['region_name'] ?? ''));
        $rawDisplayRegionName = trim((string) (
            $area['display_region_name']
            ?? $payload['display_region_name']
            ?? $payload['region_display_name']
            ?? $rawRegionName
        ));
        $context = $this->articleContext($featuredArticle);
        $regionName = $this->normalizeRegionName($rawRegionName, $featuredArticle);
        if ($regionName === '') {
            return null;
        }

        $displayRegionName = $this->normalizeDisplayRegionName(
            $rawDisplayRegionName !== '' ? $rawDisplayRegionName : $rawRegionName,
            $regionName,
            $featuredArticle
        );
        $regionKey = $this->buildRegionKey($regionName, $displayRegionName);

        $coordinates = $this->resolveCoordinates(
            $displayRegionName !== '' && ! $this->coordinateResolver->isGenericRegionName($displayRegionName)
                ? $displayRegionName
                : $regionName,
            $featuredArticle
        );
        $existingTension = $this->findExistingTension($featuredArticle, $regionKey);

        $statusLabel = trim((string) ($payload['status_label'] ?? ''));
        $rawRisk = $this->normalizeRiskScore($payload['risk_score'] ?? 0);
        $agentTrend = $this->normalizeTrendDirection($payload['trend_direction'] ?? 'stable');
        $riskScore = max(1, min(100, $this->riskScoreCalibration->calibrate($rawRisk, $context, $statusLabel, $agentTrend)));
        $trendDirection = $agentTrend;

        $attributes = [
            'region_name' => Str::limit($regionName, 255, ''),
            'display_region_name' => Str::limit($displayRegionName !== '' ? $displayRegionName : $regionName, 255, ''),
            'region_key' => Str::limit($regionKey !== '' ? $regionKey : $regionName, 255, ''),
            'risk_score' => $riskScore,
            'trend_direction' => $trendDirection,
            'status_label' => Str::limit($statusLabel !== '' ? $statusLabel : 'Tensione geopolitica', 255, ''),
            'featured_article_id' => $featuredArticle?->id,
            'last_event_at' => now(),
            'updated_at' => now(),
            'latitude' => $coordinates['lat'] ?? null,
            'longitude' => $coordinates['long'] ?? null,
        ];

        $tension = $this->persistTension($existingTension, $attributes);

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
        Cache::forget('global_tension_trend');
    }

    /**
     * @return array{
     *     initial_risk_score: int,
     *     current_tension: int,
     *     silence_hours: int,
     *     min_active_risk_score: int,
     *     ttl_hours: int,
     *     expires_at: string|null,
     *     is_expired: bool,
     *     radio_silence_label: string
     * }
     */
    public function lifecycleSnapshot(GeopoliticalTension $tension): array
    {
        $referenceAt = $tension->last_event_at ?? $tension->updated_at;
        $ttlHours = $this->tensionTtlHours();
        $minActiveRiskScore = $this->minActiveRiskScore();
        $expiresAt = $referenceAt?->copy()->addHours($ttlHours);
        $now = now();
        $isExpired = $expiresAt !== null && $now->greaterThanOrEqualTo($expiresAt);
        $isActive = ! $isExpired && (int) $tension->risk_score >= $minActiveRiskScore;

        return [
            'initial_risk_score' => (int) $tension->risk_score,
            'current_tension' => (int) $tension->risk_score,
            'silence_hours' => $referenceAt ? (int) $referenceAt->diffInHours($now) : 0,
            'min_active_risk_score' => $minActiveRiskScore,
            'ttl_hours' => $ttlHours,
            'expires_at' => $expiresAt?->toISOString(),
            'is_expired' => $isExpired,
            'radio_silence_label' => $isExpired
                ? 'Scaduta'
                : ((int) $tension->risk_score < $minActiveRiskScore
                    ? sprintf('Sotto soglia %d', $minActiveRiskScore)
                    : sprintf('Valida per %d ore', $ttlHours)),
        ];
    }

    public function resolveTrendDirection(GeopoliticalTension $tension): string
    {
        $ttlHours = $this->tensionTtlHours();
        $referenceAt = $tension->last_event_at ?? $tension->updated_at;

        if ($referenceAt && now()->greaterThanOrEqualTo($referenceAt->copy()->addHours($ttlHours))) {
            return 'falling';
        }

        return $this->normalizeTrendDirection($tension->trend_direction);
    }

    public function normalizeRegionName(string $regionName, ?Article $article = null): string
    {
        $regionName = trim($regionName);
        $regionName = $this->normalizeDescriptiveRegionLabel($regionName);
        $regionName = $this->primaryRegionNameFromLabel($regionName);

        $context = $this->articleHeadlineContext($article);
        if ($context === '') {
            $context = $this->articleContext($article);
        }

        if ($regionName !== '') {
            $configuredRegionName = $this->coordinateResolver->canonicalConfiguredRegionName($regionName);
            if ($configuredRegionName !== null) {
                $configuredRegionName = trim($configuredRegionName);
                if ($configuredRegionName !== '' && ! $this->coordinateResolver->isGenericRegionName($configuredRegionName)) {
                    return Str::limit($configuredRegionName, 255, '');
                }
            }
        }

        if ($context !== '') {
            $contextRegionName = $this->coordinateResolver->canonicalRegionNameFromText($context);
            if ($contextRegionName !== null) {
                $contextRegionName = trim($contextRegionName);
                if ($contextRegionName !== '' && ! $this->coordinateResolver->isGenericRegionName($contextRegionName)) {
                    return Str::limit($contextRegionName, 255, '');
                }
            }
        }

        if ($context !== '') {
            $resolvedRegionName = $this->coordinateResolver->canonicalRegionName($regionName, $context);
            if ($resolvedRegionName !== null) {
                $resolvedRegionName = trim($resolvedRegionName);
                if ($resolvedRegionName !== '' && ! $this->coordinateResolver->isGenericRegionName($resolvedRegionName)) {
                    return Str::limit($resolvedRegionName, 255, '');
                }
            }
        }

        return $regionName !== ''
            ? Str::limit($regionName, 255, '')
            : '';
    }

    public function normalizeDisplayRegionName(string $displayRegionName, string $baseRegionName, ?Article $article = null): string
    {
        $displayRegionName = trim($displayRegionName);
        $displayRegionName = $this->normalizeDescriptiveRegionLabel($displayRegionName);
        $baseRegionName = trim($baseRegionName);
        $context = $this->articleHeadlineContext($article);
        if ($context === '') {
            $context = $this->articleContext($article);
        }

        if ($displayRegionName !== '') {
            $configuredDisplayRegionName = $this->coordinateResolver->canonicalConfiguredRegionName($displayRegionName);
            if ($configuredDisplayRegionName !== null) {
                $configuredDisplayRegionName = trim($configuredDisplayRegionName);
                if ($configuredDisplayRegionName !== '' && ! $this->coordinateResolver->isGenericRegionName($configuredDisplayRegionName)) {
                    return Str::limit($configuredDisplayRegionName, 255, '');
                }
            }

            if (! $this->coordinateResolver->isGenericRegionName($displayRegionName)) {
                return Str::limit($displayRegionName, 255, '');
            }
        }

        if ($baseRegionName !== '' && ! $this->coordinateResolver->isGenericRegionName($baseRegionName)) {
            return Str::limit($baseRegionName, 255, '');
        }

        return Str::limit((string) ($baseRegionName !== '' ? $baseRegionName : ''), 255, '');
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
                        (string) ($tension->display_region_name ?: $tension->region_name),
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
            ->active()
            ->with('featuredArticle:id,title,slug,status')
            ->get()
            ->map(function (GeopoliticalTension $tension) {
                $lifecycle = $this->lifecycleSnapshot($tension);
                $regionName = $this->normalizeRegionName((string) $tension->region_name, $tension->featuredArticle);
                $displayRegionName = trim((string) ($tension->display_region_name ?? ''));

                return [
                    'region_name' => $regionName !== '' ? $regionName : $tension->region_name,
                    'display_region_name' => $displayRegionName !== '' ? $displayRegionName : $regionName,
                    'region_key' => (string) ($tension->region_key ?? ''),
                    'risk_score' => $lifecycle['current_tension'],
                    'initial_risk_score' => $lifecycle['initial_risk_score'],
                    'current_tension' => $lifecycle['current_tension'],
                    'trend_direction' => $tension->trend_direction,
                    'status_label' => $tension->status_label,
                    'status_color' => $this->statusColorForScore($lifecycle['current_tension']),
                    'silence_hours' => $lifecycle['silence_hours'],
                    'radio_silence_label' => $lifecycle['radio_silence_label'],
                    'severity' => GeopoliticalSeverity::fromRiskScore($lifecycle['current_tension']),
                    'article_url' => $this->articleUrl($tension),
                    'is_expired' => $lifecycle['is_expired'],
                ];
            })
            ->sortBy([
                ['current_tension', 'desc'],
                ['display_region_name', 'asc'],
                ['region_name', 'asc'],
            ])
            ->take($limit)
            ->values();
    }

    /**
     * @param  array<string, mixed>  $agentOutput
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

    private function tensionTtlHours(): int
    {
        return max(1, (int) config('ai_news.tensions.ttl_hours', self::DEFAULT_TTL_HOURS));
    }

    private function minActiveRiskScore(): int
    {
        return max(1, (int) config('ai_news.tensions.min_active_risk_score', self::DEFAULT_MIN_ACTIVE_RISK_SCORE));
    }

    private function findExistingTensionForArticle(?Article $article): ?GeopoliticalTension
    {
        if ($article === null) {
            return null;
        }

        return GeopoliticalTension::query()
            ->where('featured_article_id', $article->id)
            ->first();
    }

    private function findExistingTension(?Article $article, string $regionKey): ?GeopoliticalTension
    {
        if ($regionKey !== '') {
            $normalizedKey = $this->normalizeRegionKeyForLookup($regionKey);

            $existingByKey = GeopoliticalTension::query()
                ->where('region_key', $normalizedKey)
                ->first();

            if ($existingByKey !== null) {
                return $existingByKey;
            }

            // fallback fuzzy: stesso prefisso
            $fuzzy = GeopoliticalTension::query()
                ->where('region_key', 'like', $normalizedKey.'%')
                ->first();

            if ($fuzzy !== null) {
                return $fuzzy;
            }
        }

        return $this->findExistingTensionForArticle($article);
    }

    private function normalizeRegionKeyForLookup(string $key): string
    {
        return Str::of($key)
            ->lower()
            ->replaceMatches('/[^a-z0-9_]+/', '_')
            ->replace('__', '_')
            ->trim('_')
            ->value();
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

    private function persistTension(?GeopoliticalTension $existingTension, array $attributes): GeopoliticalTension
    {
        if ($existingTension !== null) {
            return $this->updateExistingTension($existingTension, $attributes);
        }

        if (! empty($attributes['region_key'])) {
            $existingTension = GeopoliticalTension::query()
                ->where('region_key', $attributes['region_key'])
                ->first();

            if ($existingTension !== null) {
                return $this->updateExistingTension($existingTension, $attributes);
            }
        }

        return GeopoliticalTension::query()
            ->create($this->storedTensionAttributes($attributes));
    }

    private function updateExistingTension(GeopoliticalTension $existingTension, array $attributes): GeopoliticalTension
    {
        $updates = [
            'region_name' => $this->preferredRegionName(
                (string) $existingTension->region_name,
                (string) $attributes['region_name']
            ),
            'display_region_name' => $this->preferredDisplayRegionName(
                (string) ($existingTension->display_region_name ?? $existingTension->region_name),
                (string) ($attributes['display_region_name'] ?? $attributes['region_name'])
            ),
            'region_key' => $this->preferredRegionKey(
                (string) ($existingTension->region_key ?? ''),
                (string) ($attributes['region_key'] ?? '')
            ),
            'latitude' => $attributes['latitude'] ?? $existingTension->latitude,
            'longitude' => $attributes['longitude'] ?? $existingTension->longitude,
            'risk_score' => (int) $attributes['risk_score'],
            'trend_direction' => (string) $attributes['trend_direction'],
            'status_label' => (string) $attributes['status_label'],
            'featured_article_id' => $attributes['featured_article_id'],
            'last_event_at' => $attributes['last_event_at'],
            'updated_at' => $attributes['updated_at'],
        ];

        $existingTension->update($updates);

        return $existingTension->fresh() ?? $existingTension;
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function storedTensionAttributes(array $attributes): array
    {
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

    private function preferredDisplayRegionName(string $currentRegion, string $incomingRegion): string
    {
        $currentRegion = trim($currentRegion);
        $incomingRegion = trim($incomingRegion);

        if ($incomingRegion === '') {
            return $currentRegion;
        }

        if ($currentRegion === '') {
            return $incomingRegion;
        }

        if ($currentRegion === $incomingRegion) {
            return $currentRegion;
        }

        if ($this->coordinateResolver->isGenericRegionName($currentRegion) && ! $this->coordinateResolver->isGenericRegionName($incomingRegion)) {
            return $incomingRegion;
        }

        if (mb_strlen($incomingRegion) > mb_strlen($currentRegion) + 3) {
            return $incomingRegion;
        }

        return $currentRegion;
    }

    private function preferredRegionKey(string $currentKey, string $incomingKey): string
    {
        $currentKey = trim($currentKey);
        $incomingKey = trim($incomingKey);

        if ($incomingKey === '') {
            return $currentKey;
        }

        if ($currentKey === '') {
            return $incomingKey;
        }

        return mb_strlen($incomingKey) >= mb_strlen($currentKey) ? $incomingKey : $currentKey;
    }

    public function buildRegionKey(string $baseRegionName, string $displayRegionName): string
    {
        $source = trim($displayRegionName !== '' ? $displayRegionName : $baseRegionName);

        if ($source === '') {
            return '';
        }

        $source = $this->normalizeDescriptiveRegionLabel($source);
        $parts = preg_split('~\s*[-/:]\s*~u', $source) ?: [$source];

        $parts = array_values(array_filter(array_map(
            fn (string $part) => $this->normalizeRegionKeyPart($part),
            $parts
        )));

        // return implode('_', $parts);
        return Str::of(implode('_', $parts))
            ->lower()
            ->value();
    }

    private function normalizeRegionKeyPart(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        $ascii = Str::of($value)
            ->ascii()
            ->replaceMatches('/[^A-Za-z0-9]+/', ' ')
            ->squish()
            ->value();

        if ($ascii === '') {
            return '';
        }

        if (preg_match('/^[A-Z0-9]{2,6}$/', $ascii) === 1) {
            return $ascii;
        }

        $headlined = Str::of($ascii)->headline()->replace(' ', '_')->value();

        return $headlined !== '' ? $headlined : '';
    }

    private function primaryRegionNameFromLabel(string $regionName): string
    {
        $regionName = trim($regionName);
        if ($regionName === '') {
            return '';
        }

        $parts = preg_split('~\s*[-/:]\s*~u', $regionName) ?: [$regionName];

        return trim((string) ($parts[0] ?? $regionName));
    }

    private function normalizeDescriptiveRegionLabel(string $regionName): string
    {
        $regionName = preg_replace('~\s*([\-/:])\s*~u', '$1', $regionName) ?? $regionName;

        return trim($regionName);
    }
}
