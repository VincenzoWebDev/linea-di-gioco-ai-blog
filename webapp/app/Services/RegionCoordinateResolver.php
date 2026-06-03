<?php

namespace App\Services;

use Illuminate\Support\Str;

class RegionCoordinateResolver
{
    private const GEO_CITY_INDEX_PATH = 'app/geo/geo_city_index.json';

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
            $hints = $this->extractGeopoliticalHints($this->normalize($regionName . ' ' . $context));

            $geoCityMatch = $this->matchGeoCityIndex($this->normalize($regionName . ' ' . $context));
            if ($geoCityMatch !== null) {
                return $geoCityMatch;
            }

            foreach ($hints as $hint) {
                $match = $this->matchHaystack($this->normalize($hint));
                if ($match !== null) {
                    return $match;
                }
            }

            return $context !== ''
                ? $this->matchHaystack($this->normalize($context))
                : null;
        }

        $regionMatch = $regionName !== ''
            ? $this->matchHaystack($this->normalize($regionName))
            : null;

        $haystack = $this->normalize(trim($regionName . ' ' . $context));
        $hints = $this->extractGeopoliticalHints($haystack);

        if (!empty($hints)) {
            $haystack .= ' ' . implode(' ', $hints);
        }

        /**
         * 🔥 NUOVO: estrazione intelligente dei luoghi dal testo
         */
        $hints = $this->extractGeopoliticalHints($haystack);

        foreach ($hints as $hint) {
            $match = $this->matchHaystack($this->normalize($hint));

            if ($match !== null) {
                return $match;
            }
        }

        $geoCityMatch = $this->matchGeoCityIndex($haystack);
        if ($geoCityMatch !== null) {
            return $geoCityMatch;
        }

        /**
         * fallback vecchio (solo se tutto fallisce)
         */
        if ($this->isGenericRegion($haystack) && $context !== '') {
            return $this->matchHaystack($this->normalize($context))
                ?? $this->matchGeoCityIndex($this->normalize($context));
        }

        $haystackMatch = $this->matchHaystack($haystack);
        $geoCityHaystackMatch = $this->matchGeoCityIndex($haystack);

        if ($geoCityHaystackMatch !== null) {
            return $geoCityHaystackMatch;
        }

        if ($haystackMatch !== null || $regionMatch !== null) {
            return $haystackMatch ?? $regionMatch;
        }

        return null;
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

    /**
     * @return list<array{aliases: list<string>, lat: float, long: float, label: string, type: string}>
     */
    private function geoCityIndex(): array
    {
        static $index = null;

        if (is_array($index)) {
            return $index;
        }

        $path = storage_path(self::GEO_CITY_INDEX_PATH);
        if (! is_file($path)) {
            return $index = [];
        }

        $raw = json_decode((string) file_get_contents($path), true);
        if (! is_array($raw)) {
            return $index = [];
        }

        $index = [];
        foreach ($raw as $entry) {
            if (! is_array($entry)) {
                continue;
            }

            $lat = isset($entry['lat']) && is_numeric($entry['lat']) ? (float) $entry['lat'] : null;
            $long = isset($entry['lng']) && is_numeric($entry['lng']) ? (float) $entry['lng'] : null;
            $name = trim((string) ($entry['name'] ?? ''));
            if ($lat === null || $long === null || $name === '') {
                continue;
            }

            $aliases = array_filter(array_map(
                fn ($value) => trim((string) $value),
                array_merge(
                    [$name],
                    is_array($entry['aliases'] ?? null) ? $entry['aliases'] : [],
                )
            ));
            $admin1 = trim((string) ($entry['admin1'] ?? ''));
            if ($admin1 !== '') {
                $normalizedAdmin1 = $this->normalize($admin1);
                $genericAdmin1 = [
                    'nord',
                    'sud',
                    'est',
                    'ovest',
                    'north',
                    'south',
                    'east',
                    'west',
                ];

                if (
                    $normalizedAdmin1 !== ''
                    && mb_strlen($normalizedAdmin1) >= 5
                    && ! in_array($normalizedAdmin1, $genericAdmin1, true)
                ) {
                    $aliases[] = $admin1;
                }
            }
            $normalizedAliases = [];
            foreach ($aliases as $alias) {
                $normalizedAlias = $this->normalize($alias);
                if ($normalizedAlias !== '') {
                    $normalizedAliases[] = $normalizedAlias;
                }
            }

            $index[] = [
                'aliases' => array_values(array_unique($normalizedAliases)),
                'lat' => $lat,
                'long' => $long,
                'label' => $this->geoCityLabel($entry),
                'type' => trim((string) ($entry['type'] ?? '')),
            ];
        }

        return $index;
    }

    /**
     * @return array{lat: float, long: float, label: string}|null
     */
    private function matchGeoCityIndex(string $haystack): ?array
    {
        if ($haystack === '') {
            return null;
        }

        $bestScore = 0;
        $bestPoint = null;

        foreach ($this->geoCityIndex() as $entry) {
            foreach ($entry['aliases'] as $alias) {
                if ($alias === '' || mb_strlen($alias) < 3) {
                    continue;
                }

                if (! $this->aliasMatchesHaystack($haystack, $alias)) {
                    continue;
                }

                $score = mb_strlen($alias) + $this->geoCityTypeBonus($entry['type']);
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestPoint = [
                        'lat' => (float) $entry['lat'],
                        'long' => (float) $entry['long'],
                        'label' => $entry['label'],
                    ];
                }
            }
        }

        return $bestPoint;
    }

    /**
     * @param array{name?: mixed, admin1?: mixed, country?: mixed} $entry
     */
    private function geoCityLabel(array $entry): string
    {
        $name = trim((string) ($entry['name'] ?? ''));
        $admin1 = trim((string) ($entry['admin1'] ?? ''));

        if ($name === '') {
            return 'Area non specificata';
        }

        if ($admin1 === '') {
            return $name;
        }

        return $name.', '.$admin1;
    }

    private function geoCityTypeBonus(string $type): int
    {
        return match ($type) {
            'PPLC' => 30,
            'PPLA' => 25,
            'PPLA2' => 20,
            'PPLA3' => 15,
            'PPLA4' => 10,
            default => 0,
        };
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

        $pattern = '/(?:^|\s)' . preg_quote($alias, '/') . '(?:\s|$)/u';

        return preg_match($pattern, $haystack) === 1;
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

    private function extractGeopoliticalHints(string $text): array
    {
        $keywords = [
            // super potenze
            'usa',
            'u.s.',
            'u.s.a',
            'united states',
            'stati uniti',
            'russia',
            'russian',
            'ukraine',
            'ukrainian',
            'china',
            'chinese',

            // medio oriente
            'iran',
            'iraq',
            'israel',
            'palestine',
            'gaza',
            'west bank',
            'syria',
            'lebanon',
            'yemen',

            // asia
            'taiwan',
            'north korea',
            'south korea',
            'japan',

            // europa
            'nato',
            'eu',
            'european union',

            // africa
            'africa',
            'sudan',
            'ethiopia',

            // geografie strategiche
            'red sea',
            'strait',
            'straits',
            'mediterranean',
            'persian gulf',
            'arabian sea',

            // militare (importantissimo per il tuo problema)
            'base militare',
            'military base',
            'us base',
            'american base',
            'forze statunitensi',
            'forces',
            'troops',
            'soldiers',
            'missile',
            'airstrike',
            'strike',
            'raid',
            'drone',

            // politica / escalation
            'sanctions',
            'sanzioni',
            'tensions',
            'escalation',
            'war',
            'guerra',
        ];

        $found = [];

        foreach ($keywords as $k) {
            if (str_contains($text, $this->normalize($k))) {
                $found[] = $k;
            }
        }

        return array_values(array_unique($found));
    }
}

