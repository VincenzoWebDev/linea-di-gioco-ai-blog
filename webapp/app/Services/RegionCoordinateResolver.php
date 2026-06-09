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

        if ($match) {
            return [
                'lat' => $match['lat'],
                'long' => $match['long'],
            ];
        }

        // Automatic AI-based geocoding fallback for places not in our static config!
        $resolvedPlaceName = trim($regionName !== '' ? $regionName : $context);
        if ($resolvedPlaceName !== '' && ! $this->isGenericRegionName($resolvedPlaceName)) {
            $aiCoords = $this->resolveViaAi($resolvedPlaceName);
            if ($aiCoords !== null) {
                return $aiCoords;
            }
        }

        return null;
    }

    public function canonicalRegionName(string $regionName, string $context = ''): ?string
    {
        $match = $this->resolveMatch($regionName, $context);

        return $match['label'] ?? null;
    }

    public function canonicalConfiguredRegionName(string $regionName): ?string
    {
        $regionName = trim($regionName);
        if ($regionName === '') {
            return null;
        }

        $match = $this->matchHaystack($this->normalizePlaceName($regionName));

        return $match['label'] ?? null;
    }

    public function canonicalRegionNameFromText(string $text): ?string
    {
        $text = trim($text);
        if ($text === '') {
            return null;
        }

        $match = $this->matchHaystack($this->normalizePlaceName($text));

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

        // Try direct matching of regionName first (high priority)
        if ($regionName !== '') {
            $match = $this->matchHaystack($this->normalizePlaceName($regionName), true);
            if ($match !== null) {
                return $match;
            }
        }

        // Fall back to context matching (lower priority fallback)
        if ($context !== '') {
            $match = $this->matchHaystack($this->normalizePlaceName($context), false);
            if ($match !== null) {
                return $match;
            }
        }

        return null;
    }

    /**
     * @return array{lat: float, long: float, label: string}|null
     */
    private function matchHaystack(string $haystack, bool $isDirect = false): ?array
    {
        if ($haystack === '' || $this->isGenericRegion($haystack)) {
            return null;
        }

        $bestScore = -1.0;
        $bestPoint = null;

        // Global actor aliases to penalize on fallback matching to prevent hijacking local teathers
        $globalActors = [
            'united states', 'stati uniti', 'usa', 'u s', 'washington', 'pentagon', 'white house',
            'united kingdom', 'regno unito', 'london', 'londra', 'britain',
            'european union', 'unione europea', 'bruxelles', 'brussels', 'europa',
            'nato', 'atlantic',
        ];

        foreach ($this->regions() as $entry) {
            foreach ($entry['aliases'] as $alias) {
                $normalizedAlias = $this->normalizePlaceName($alias);
                if ($normalizedAlias === '' || mb_strlen($normalizedAlias) < 3) {
                    continue;
                }

                if (! $this->aliasMatchesHaystack($haystack, $normalizedAlias)) {
                    continue;
                }

                // Base score: length of the matched alias
                $baseScore = (float) mb_strlen($normalizedAlias);
                $finalScore = $baseScore;

                if (! $isDirect) {
                    // 1. Frequency calculation: reward highly repeated places
                    $pattern = '/(?<!\pL)' . preg_quote($normalizedAlias, '/') . '(?!\pL)/u';
                    $occurrences = preg_match_all($pattern, $haystack);
                    $frequency = max(1, $occurrences);
                    
                    $finalScore *= (1.0 + ($frequency - 1) * 0.5);

                    // 2. Position bonus: if found early in the text (first 300 characters), give it a 30% boost
                    $pos = mb_strpos($haystack, $normalizedAlias);
                    if ($pos !== false && $pos < 300) {
                        $finalScore *= 1.3;
                    }

                    // 3. Global actor penalty: if matching on context (not direct) and it is a global actor,
                    // we penalize it by 60% so it doesn't hijack specific local regions
                    if (in_array($normalizedAlias, $globalActors, true)) {
                        $finalScore *= 0.4;
                    }
                } else {
                    // For direct matches, we give a massive boost
                    $finalScore = $baseScore * 10.0;
                }

                if ($finalScore > $bestScore) {
                    $bestScore = $finalScore;
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

    private function normalizePlaceName(string $value): string
    {
        return $this->normalize($value);
    }

    private function resolveViaAi(string $placeName): ?array
    {
        if (! (bool) config('ai_news.ai.enabled', false)) {
            return null;
        }

        $provider = (string) config('ai_news.ai.provider', 'ollama');
        $model = (string) config('ai_news.ai.model', 'llama3.1');
        $baseUrl = rtrim((string) config('ai_news.ai.base_url', 'http://127.0.0.1:11434'), '/');

        if ($model === '') {
            return null;
        }

        $systemPrompt = 'Sei un geografo esperto. Rispondi solo con JSON valido.';
        $userPrompt = <<<PROMPT
Trova le coordinate geografiche (latitudine e longitudine) precise per questa localita: "{$placeName}".
Rispondi esclusivamente con un oggetto JSON avente le seguenti chiavi numeriche:
{
  "lat": 34.0522,
  "long": -118.2437
}
Non aggiungere spiegazioni o testo fuori dal JSON. Se non trovi la localita, restituisci un oggetto vuoto.
PROMPT;

        try {
            $raw = '';
            if ($provider === 'openai') {
                $apiKey = (string) config('ai_news.ai.api_key', '');
                if ($apiKey !== '') {
                    $response = \Illuminate\Support\Facades\Http::timeout(10)
                        ->withToken($apiKey)
                        ->acceptJson()
                        ->post($baseUrl.'/chat/completions', [
                            'model' => $model,
                            'temperature' => 0.0,
                            'messages' => [
                                ['role' => 'system', 'content' => $systemPrompt],
                                ['role' => 'user', 'content' => $userPrompt],
                            ],
                            'response_format' => ['type' => 'json_object'],
                        ]);
                    if ($response->successful()) {
                        $raw = (string) data_get($response->json(), 'choices.0.message.content', '');
                    }
                }
            } else {
                $response = \Illuminate\Support\Facades\Http::timeout(10)
                    ->acceptJson()
                    ->post($baseUrl.'/api/chat', [
                        'model' => $model,
                        'stream' => false,
                        'format' => 'json',
                        'options' => ['temperature' => 0.0],
                        'messages' => [
                            ['role' => 'system', 'content' => $systemPrompt],
                            ['role' => 'user', 'content' => $userPrompt],
                        ],
                    ]);
                if ($response->successful()) {
                    $raw = (string) data_get($response->json(), 'message.content', '');
                }
            }

            if ($raw !== '') {
                $decoded = json_decode($raw, true);
                if (! is_array($decoded) && preg_match('/\{.*\}/s', $raw, $matches) === 1) {
                    $decoded = json_decode($matches[0], true);
                }

                if (is_array($decoded) && isset($decoded['lat']) && isset($decoded['long'])) {
                    $lat = (float) $decoded['lat'];
                    $long = (float) $decoded['long'];

                    if ($lat >= -90 && $lat <= 90 && $long >= -180 && $long <= 180) {
                        return [
                            'lat' => round($lat, 4),
                            'long' => round($long, 4),
                        ];
                    }
                }
            }
        } catch (\Throwable) {
            return null;
        }

        return null;
    }
}
