<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class GeopoliticalAreaExtractionService
{
    public function __construct(
        private readonly RegionCoordinateResolver $coordinateResolver
    ) {}

    /**
     * @param array<string, mixed> $payload
     * @return array{region_name: string, display_region_name: string}
     */
    public function extract(array $payload): array
    {
        $title = trim((string) ($payload['title'] ?? ''));
        $summary = trim((string) ($payload['summary'] ?? ''));
        $content = trim((string) ($payload['content'] ?? ''));
        $candidateRegion = trim((string) ($payload['region_name'] ?? $payload['candidate_region_name'] ?? ''));
        $candidateDisplay = trim((string) ($payload['display_region_name'] ?? $payload['candidate_display_region_name'] ?? ''));
        $context = $this->buildContext($title, $summary, $content);

        $decoded = $this->extractViaAi($title, $summary, $content, $candidateRegion, $candidateDisplay);
        if ($decoded !== []) {
            return $this->normalizeExtraction($decoded, $context, $candidateRegion, $candidateDisplay);
        }

        return $this->fallbackExtraction($context, $candidateRegion, $candidateDisplay);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array{region_name: string, display_region_name: string}
     */
    public function extractFromArticle(?Article $article, array $payload = []): array
    {
        $articlePayload = array_merge([
            'title' => $article?->title ?? '',
            'summary' => $article?->summary ?? '',
            'content' => $article?->content ? strip_tags((string) $article->content) : '',
        ], $payload);

        return $this->extract($articlePayload);
    }

    /**
     * @return array<string, mixed>
     */
    private function extractViaAi(
        string $title,
        string $summary,
        string $content,
        string $candidateRegion,
        string $candidateDisplay
    ): array {
        if (! (bool) config('ai_news.ai.enabled', false)) {
            return [];
        }

        $baseUrl = rtrim((string) config('ai_news.ai.base_url', 'http://127.0.0.1:11434'), '/');
        $model = (string) config('ai_news.ai.model', 'llama3.1');

        if ($model === '') {
            return [];
        }

        $systemPrompt = 'Sei un analista geopolitico. Rispondi solo in italiano e solo con JSON valido.';
        $userPrompt = <<<PROMPT
Analizza la notizia e restituisci solo JSON con:
- region_name: il Paese, macro-area o teatro geopolitico principale.
- display_region_name: la citta, base, porto, isola o localita specifica solo se e esplicitamente presente nel testo.

Regole:
- Cerca target, destinazione o luogo dell'evento.
- Se esiste una citta/base/porto specifico, usa quello per display_region_name.
- Altrimenti usa il Paese in cui si verifica l'evento.
- Solo se l'evento riguarda il territorio dell'attore (es. elezioni USA, crisi politica USA) usa il Paese dell'attore.
- Se il testo descrive un teatro geopolitico piu ampio e supportato dal contesto, usa quello per region_name.
- Non inventare toponimi.
- Se non trovi un luogo specifico, usa display_region_name uguale a region_name.
- Se non riesci a stabilire un'area affidabile, usa region_name "Geopolitica".

Esempio:
- Attore: Stati Uniti
- Nave: Botswana
- Destinazione strategica: Isola di Kharg
- Paese associato: Iran
- Output corretto: {"region_name":"Iran","display_region_name":"Isola di Kharg"}

Contesto:
Titolo: {$title}
Sottotitolo: {$summary}
Testo:
{$content}

Suggerimenti non affidabili:
region_name candidato: {$candidateRegion}
display_region_name candidato: {$candidateDisplay}
PROMPT;

        try {
            $response = Http::timeout((int) config('ai_news.ai.timeout_seconds', 30))
                ->acceptJson()
                ->post($baseUrl . '/api/chat', [
                    'model' => $model,
                    'stream' => false,
                    'format' => 'json',
                    'options' => [
                        'temperature' => (float) config('ai_news.ai.temperature', 0.4),
                    ],
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);

            if (! $response->successful()) {
                return [];
            }

            $raw = (string) data_get($response->json(), 'message.content', '');
            return $this->decodeJsonPayload($raw);
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJsonPayload(string $raw): array
    {
        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded) && preg_match('/\{.*\}/s', $raw, $matches) === 1) {
            $decoded = json_decode($matches[0], true);
        }

        if (! is_array($decoded)) {
            return [];
        }

        return $decoded;
    }

    /**
     * @param array<string, mixed> $decoded
     * @return array{region_name: string, display_region_name: string}
     */
    private function normalizeExtraction(array $decoded, string $context, string $candidateRegion, string $candidateDisplay): array
    {
        $decodedRegion = $this->cleanLabel((string) ($decoded['region_name'] ?? ''));
        $decodedDisplay = $this->cleanLabel((string) (
            $decoded['display_region_name']
            ?? $decoded['region_display_name']
            ?? ''
        ));

        $regionName = $this->resolveRegionName($decodedRegion, $context, $candidateRegion);
        $displayRegionName = $this->resolveDisplayRegionName($decodedDisplay, $context, $regionName, $candidateDisplay);

        if ($regionName === '') {
            $regionName = 'Geopolitica';
        }

        if ($displayRegionName === '') {
            $displayRegionName = $regionName;
        }

        return [
            'region_name' => $regionName,
            'display_region_name' => Str::ucfirst($displayRegionName),
        ];
    }

    /**
     * @return array{region_name: string, display_region_name: string}
     */
    private function fallbackExtraction(string $context, string $candidateRegion, string $candidateDisplay): array
    {
        $regionName = $this->resolveRegionName('', $context, $candidateRegion);
        $displayRegionName = $regionName;

        if ($regionName === '') {
            $regionName = 'Geopolitica';
        }

        if ($displayRegionName === '') {
            $displayRegionName = $regionName;
        }

        return [
            'region_name' => $regionName,
            'display_region_name' => Str::ucfirst($displayRegionName),
        ];
    }

    private function resolveRegionName(
        string $decodedRegion,
        string $context,
        string $candidateRegion
    ): string {
        $candidateRegion = $this->cleanLabel($candidateRegion);
        $decodedRegion = $this->cleanLabel($decodedRegion);

        foreach (array_filter([$candidateRegion, $decodedRegion]) as $label) {
            $configured = $this->coordinateResolver->canonicalConfiguredRegionName($label);
            if ($configured !== null) {
                return $configured;
            }

            if ($this->mentionsText($label, $context)) {
                $resolved = $this->coordinateResolver->canonicalRegionName($label, $context);
                if ($resolved !== null && ! $this->isGenericLabel($resolved)) {
                    return $resolved;
                }
            }
        }

        $fromText = $this->coordinateResolver->canonicalRegionNameFromText($context);
        if ($fromText !== null && ! $this->isGenericLabel($fromText)) {
            return $fromText;
        }

        return '';
    }

    private function resolveDisplayRegionName(
        string $decodedDisplay,
        string $context,
        string $regionName,
        string $candidateDisplay
    ): string {
        $candidateDisplay = $this->cleanLabel($candidateDisplay);
        $decodedDisplay = $this->cleanLabel($decodedDisplay);

        foreach (array_filter([$candidateDisplay, $decodedDisplay]) as $label) {
            if (! $this->mentionsText($label, $context)) {
                continue;
            }

            $configured = $this->coordinateResolver->canonicalConfiguredRegionName($label);
            if ($configured !== null && ! $this->isGenericLabel($configured)) {
                return $configured;
            }

            return $label;
        }

        return $regionName;
    }

    private function buildContext(string $title, string $summary, string $content): string
    {
        return trim(implode(' ', array_filter([
            $title,
            $summary,
            $content !== '' ? Str::limit(strip_tags($content), 5000, '') : null,
        ])));
    }

    private function cleanLabel(string $value): string
    {
        $value = strip_tags($value);
        $value = preg_replace('/\s+/u', ' ', trim($value)) ?? trim($value);

        return $value;
    }

    private function mentionsText(string $needle, string $text): bool
    {
        $needle = $this->normalize($needle);
        $text = $this->normalize($text);

        if ($needle === '' || $text === '') {
            return false;
        }

        return str_contains($text, $needle);
    }

    private function normalize(string $value): string
    {
        $normalized = Str::of($value)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->squish()
            ->value();

        return preg_replace('/\s+/', ' ', $normalized) ?? $normalized;
    }

    private function isGenericLabel(string $value): bool
    {
        $normalized = $this->normalize($value);

        return $normalized === ''
            || in_array($normalized, [
                'geopolitica',
                'area non specificata',
                'non specificata',
                'non specificato',
            ], true);
    }
}
