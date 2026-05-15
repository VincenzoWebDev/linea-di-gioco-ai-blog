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
        $regionName = trim($regionName);
        if ($regionName === '') {
            return null;
        }

        $haystack = $this->normalize($regionName.' '.$context);

        if ($this->isGenericRegion($haystack)) {
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

                if (! str_contains($haystack, $normalizedAlias)) {
                    continue;
                }

                $score = mb_strlen($normalizedAlias);
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestPoint = [
                        'lat' => (float) $entry['lat'],
                        'long' => (float) $entry['long'],
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
