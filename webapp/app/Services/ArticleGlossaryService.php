<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class ArticleGlossaryService
{
    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    public function build(string $title, string $content): array
    {
        $content = trim($content);
        if ($content === '') {
            return [];
        }

        $merged = $this->baseTermsInContent($content);

        if ((bool) config('ai_news.glossary.enabled', true)) {
            foreach ($this->extractViaAi($title, $content) as $term => $entry) {
                if ($this->termAppearsInContent($term, $content)) {
                    $merged[$term] = $entry;
                }
            }
        }

        return $this->sortAndLimit($merged);
    }

    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    private function baseTermsInContent(string $content): array
    {
        $base = config('geopolitical_glossary_base', []);
        $found = [];

        foreach ($base as $term => $entry) {
            if (! is_array($entry) || ! $this->termAppearsInContent((string) $term, $content)) {
                continue;
            }

            $found[(string) $term] = [
                'definition' => (string) ($entry['definition'] ?? ''),
                'importance' => (string) ($entry['importance'] ?? 'Media'),
            ];
        }

        return $found;
    }

    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    private function extractViaAi(string $title, string $content): array
    {
        if (! (bool) config('ai_news.ai.enabled', false)) {
            return [];
        }

        $provider = (string) config('ai_news.ai.provider', 'ollama');
        $model = (string) config('ai_news.ai.model', 'llama3.1');
        $baseUrl = rtrim((string) config('ai_news.ai.base_url', 'http://127.0.0.1:11434'), '/');

        if ($model === '') {
            return [];
        }

        $excerpt = Str::limit(strip_tags($content), 4500, '');

        $systemPrompt = 'Sei un editor che crea glossari per lettori non esperti di geopolitica. Rispondi solo in italiano con JSON valido.';
        $userPrompt = <<<PROMPT
Analizza il testo e individua da 6 a 12 termini che un lettore generale potrebbe non capire
(sigle, istituzioni, concetti geopolitici, luoghi strategici, operazioni militari, acronimi).

Regole:
- Includi SOLO termini che compaiono letteralmente nel testo (rispetta maiuscole/minuscole dove rilevanti).
- Definizioni chiare, max 180 caratteri, senza ripetere il termine.
- importance: "Critica", "Alta" o "Media".
- Non duplicare sinonimi; preferisci il termine più specifico usato nel testo.
- Rispondi SOLO con JSON: {"terms":[{"term":"...","definition":"...","importance":"..."}]}

Titolo: {$title}

Testo:
{$excerpt}
PROMPT;

        try {
            $raw = $provider === 'openai'
                ? $this->openAiContent($baseUrl, $model, $systemPrompt, $userPrompt)
                : $this->ollamaContent($baseUrl, $model, $systemPrompt, $userPrompt);

            return $this->parseAiTerms($raw);
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    private function parseAiTerms(string $raw): array
    {
        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            if (preg_match('/\{.*\}/s', $raw, $matches) === 1) {
                $decoded = json_decode($matches[0], true);
            }
        }

        if (! is_array($decoded)) {
            return [];
        }

        $items = $decoded['terms'] ?? $decoded;
        if (! is_array($items)) {
            return [];
        }

        $terms = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $term = trim((string) ($item['term'] ?? ''));
            $definition = trim((string) ($item['definition'] ?? ''));
            $importance = trim((string) ($item['importance'] ?? 'Media'));

            if ($term === '' || $definition === '') {
                continue;
            }

            if (! in_array($importance, ['Critica', 'Alta', 'Media'], true)) {
                $importance = 'Media';
            }

            $terms[$term] = [
                'definition' => Str::limit($definition, 220, ''),
                'importance' => $importance,
            ];
        }

        return $terms;
    }

    private function ollamaContent(string $baseUrl, string $model, string $systemPrompt, string $userPrompt): string
    {
        $response = Http::timeout((int) config('ai_news.glossary.timeout_seconds', 45))
            ->acceptJson()
            ->post($baseUrl . '/api/chat', [
                'model' => $model,
                'stream' => false,
                'format' => 'json',
                'options' => [
                    'temperature' => 0.2,
                ],
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

        if (! $response->successful()) {
            return '';
        }

        return (string) data_get($response->json(), 'message.content', '');
    }

    private function openAiContent(string $baseUrl, string $model, string $systemPrompt, string $userPrompt): string
    {
        $apiKey = (string) config('ai_news.ai.api_key', '');
        if ($apiKey === '') {
            return '';
        }

        $response = Http::timeout((int) config('ai_news.glossary.timeout_seconds', 45))
            ->withToken($apiKey)
            ->acceptJson()
            ->post($baseUrl . '/chat/completions', [
                'model' => $model,
                'temperature' => 0.2,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            return '';
        }

        return (string) data_get($response->json(), 'choices.0.message.content', '');
    }

    public function termAppearsInContent(string $term, string $content): bool
    {
        $term = trim($term);
        if ($term === '') {
            return false;
        }

        $pattern = '/(?<!\p{L})' . preg_quote($term, '/') . '(?!\p{L})/iu';

        return preg_match($pattern, $content) === 1;
    }

    /**
     * @param array<string, array{definition: string, importance: string}> $terms
     * @return array<string, array{definition: string, importance: string}>
     */
    private function sortAndLimit(array $terms): array
    {
        $max = max(6, (int) config('ai_news.glossary.max_terms', 12));

        return collect($terms)
            ->sortBy(fn (array $entry, string $term) => [
                match ($entry['importance']) {
                    'Critica' => 0,
                    'Alta' => 1,
                    default => 2,
                },
                mb_strtolower($term),
            ])
            ->take($max)
            ->all();
    }
}
