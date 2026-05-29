<?php

namespace App\Services;

use Illuminate\Support\Str;

class RegionCoordinateResolver
{
    /**
     * @return array{lat: float, long: float}|null
     */
    public function resolve(string $regionName, string $context = ''): ?array
    {
        $match = $this->resolveMatch($regionName, $context);

        return $match ? [
            'lat' => $match['lat'],
            'long' => $match['long'],
        ] : null;
    }

    public function canonicalRegionName(string $regionName, string $context = ''): ?string
    {
        $regionName = trim($regionName);
        if ($regionName !== '' && ! $this->isGenericRegion($this->normalize($regionName))) {
            $match = $this->resolveMatch($regionName, $context);

            return $match['label'] ?? $regionName;
        }

        $match = $this->resolveMatch($regionName, $context);

        return $match['label'] ?? null;
    }

    public function isGenericRegionName(string $regionName): bool
    {
        return $this->isGenericRegion($this->normalize($regionName));
    }

    public function canonicalRegionNameFromCoordinates(?float $latitude, ?float $longitude): ?string
    {
        if ($latitude === null || $longitude === null) {
            return null;
        }

        foreach ($this->regions() as $entry) {
            if (
                abs(((float) $entry['lat']) - $latitude) < 0.0001
                && abs(((float) $entry['long']) - $longitude) < 0.0001
            ) {
                return $this->entryLabel($entry);
            }
        }

        return null;
    }

    /**
     * @return array{lat: float, long: float, label: string}|null
     */
    private function resolveMatch(string $regionName, string $context = ''): ?array
    {
        $regionName = trim($regionName);
        $context = trim($context);

        if ($regionName === '' && $context === '') {
            return null;
        }

        if ($regionName !== '' && $this->isGenericRegion($this->normalize($regionName))) {
            return $context !== ''
                ? $this->matchHaystack($this->normalize($context))
                : null;
        }

        $regionMatch = $regionName !== ''
            ? $this->matchHaystack($this->normalize($regionName))
            : null;

        $haystack = $this->normalize(trim($regionName.' '.$context));

        if ($this->isGenericRegion($haystack)) {
            return $context !== ''
                ? $this->matchHaystack($this->normalize($context))
                : null;
        }

        $haystackMatch = $this->matchHaystack($haystack);

        if (
            $regionMatch !== null
            && $haystackMatch !== null
            && ($haystackMatch['label'] ?? '') === 'Stati Uniti'
            && ($regionMatch['label'] ?? '') !== 'Stati Uniti'
            && $this->mentionsUnitedStatesBaseOrForces($haystack)
        ) {
            return $regionMatch;
        }

        if (
            $regionMatch !== null
            && $haystackMatch !== null
            && ($haystackMatch['label'] ?? '') !== ($regionMatch['label'] ?? '')
            && mb_strlen((string) ($haystackMatch['label'] ?? '')) <= mb_strlen((string) ($regionMatch['label'] ?? ''))
        ) {
            return $regionMatch;
        }

        return $haystackMatch ?? $regionMatch;
    }

    /**
     * @return array{lat: float, long: float, label: string}|null
     */
    private function matchHaystack(string $haystack): ?array
    {
        if ($haystack === '' || $this->isGenericRegion($haystack)) {
            return null;
        }

        $bestScore = 0;
        $bestPoint = null;

        foreach ($this->regions() as $entry) {
            foreach ($entry['aliases'] as $alias) {
                $normalizedAlias = $this->normalize($alias);
                if ($normalizedAlias === '' || mb_strlen($normalizedAlias) < 3) {
                    continue;
                }

                if (! $this->aliasMatchesHaystack($haystack, $normalizedAlias)) {
                    continue;
                }

                $score = mb_strlen($normalizedAlias);
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestPoint = [
                        'lat' => (float) $entry['lat'],
                        'long' => (float) $entry['long'],
                        'label' => $this->entryLabel($entry),
                    ];
                }
            }
        }

        return $bestPoint;
    }

    public function isMappableRegion(string $regionName, string $context = ''): bool
    {
        return $this->resolve($regionName, $context) !== null;
    }

    /**
     * @return list<array{aliases: list<string>, lat: float, long: float}>
     */
    private function regions(): array
    {
        $regions = config('geopolitical_regions.regions', []);

        return is_array($regions) ? $regions : [];
    }

    private function isGenericRegion(string $normalizedHaystack): bool
    {
        $patterns = config('geopolitical_regions.generic_region_patterns', []);

        if (! is_array($patterns)) {
            return false;
        }

        foreach ($patterns as $pattern) {
            $normalizedPattern = $this->normalize((string) $pattern);
            if ($normalizedPattern !== '' && str_contains($normalizedHaystack, $normalizedPattern)) {
                return true;
            }
        }

        return false;
    }

    private function aliasMatchesHaystack(string $haystack, string $alias): bool
    {
        if ($alias === '') {
            return false;
        }

        $pattern = '/(?:^|\s)'.preg_quote($alias, '/').'(?:\s|$)/u';

        return preg_match($pattern, $haystack) === 1;
    }

    private function mentionsUnitedStatesBaseOrForces(string $haystack): bool
    {
        return str_contains($haystack, 'base usa')
            || str_contains($haystack, 'base statunitense')
            || str_contains($haystack, 'base americana')
            || str_contains($haystack, 'forze statunitensi')
            || str_contains($haystack, 'us base')
            || str_contains($haystack, 'american base');
    }

    /**
     * @param array{aliases: list<string>, lat: float, long: float, label?: string} $entry
     */
    private function entryLabel(array $entry): string
    {
        $label = trim((string) ($entry['label'] ?? ''));
        if ($label !== '') {
            return $label;
        }

        $fallback = trim((string) ($entry['aliases'][0] ?? 'Area non specificata'));
        $mapped = [
            'united states' => 'Stati Uniti',
            'united kingdom' => 'Regno Unito',
            'south korea' => 'Corea del Sud',
            'north korea' => 'Corea del Nord',
            'european union' => 'Unione Europea',
            'middle east' => 'Medio Oriente',
            'red sea' => 'Mar Rosso',
            'south china sea' => 'Mar Cinese Meridionale',
            'taiwan strait' => 'Stretto di Taiwan',
            'horn of africa' => "Corno d'Africa",
            'western balkans' => 'Balcani Occidentali',
        ];

        $normalizedFallback = $this->normalize($fallback);

        return $mapped[$normalizedFallback] ?? Str::of($fallback)->headline()->value();
    }

    private function normalize(string $value): string
    {
        $normalized = Str::of($value)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->trim()
            ->value();

        return preg_replace('/\s+/', ' ', $normalized) ?? $normalized;
    }
}
