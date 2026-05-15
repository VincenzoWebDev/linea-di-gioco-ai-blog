<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class AiArticleWriter
{
    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|null
     */
    public function rewriteToItalian(array $payload): ?array
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

        $sourceTitle = trim((string) ($payload['title'] ?? ''));
        $sourceSummary = trim((string) ($payload['summary'] ?? ''));
        $sourceContent = trim((string) ($payload['source_content'] ?? ''));
        $sourceUrl = trim((string) ($payload['source_url'] ?? $payload['url'] ?? ''));

        $systemPrompt = 'Sei l\'editor di un blog di geopolitica. Scrivi solo in italiano, con tono giornalistico chiaro, senza copiare la fonte e senza uscire dal perimetro geopolitico-internazionale.';
        $userPrompt = <<<PROMPT
Genera un articolo in JSON con chiavi:
- title (max 120 chars)
- summary (max 240 chars)
- content (500-1500 chars, in italiano, con struttura fluida)
- topic (1-3 parole, es: geopolitica, diplomazia, sicurezza, energia)
- categories (array di 1-3 categorie in italiano coerenti con il contenuto)

Regole:
- Mantieni i fatti principali della notizia.
- Testo originale e personalizzato, no traduzione letterale.
- Tutto l'output deve essere in italiano corretto.
- L'articolo deve essere coerente con geopolitica, relazioni internazionali, sicurezza, diplomazia, guerra, energia, elezioni, istituzioni internazionali.
- Se la notizia riguarda sport, gossip, intrattenimento, lifestyle o temi fuori scope, restituisci JSON con title, summary, content vuoti e topic "scarto".
- Se manca un dato, non inventarlo.
- Se viene nominata qualche testata giornalistica, eliminala e adattala al contesto del blog.
- Non inserire mai righe o frasi finali con "Fonte:"; la fonte viene salvata separatamente in source_url.
- Rispondi solo con JSON valido, senza markdown e senza testo extra.

INPUT
Titolo fonte: {$sourceTitle}
Summary fonte: {$sourceSummary}
Testo fonte:
{$sourceContent}
PROMPT;

        try {
            $content = $provider === 'openai'
                ? $this->openAiContent($baseUrl, $model, $systemPrompt, $userPrompt)
                : $this->ollamaContent($baseUrl, $model, $systemPrompt, $userPrompt);

            if ($content === '') {
                return null;
            }

            $decoded = $this->decodeJsonPayload($content);
            if (is_array($decoded)) {
                return $decoded;
            }

            return $this->decodePlainTextPayload($content, $sourceTitle, $sourceUrl);
        } catch (Throwable) {
            return null;
        }
    }

    private function ollamaContent(string $baseUrl, string $model, string $systemPrompt, string $userPrompt): string
    {
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

        $response = Http::timeout((int) config('ai_news.ai.timeout_seconds', 30))
            ->withToken($apiKey)
            ->acceptJson()
            ->post($baseUrl . '/chat/completions', [
                'model' => $model,
                'temperature' => (float) config('ai_news.ai.temperature', 0.4),
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

    /**
     * @return array<string, mixed>|null
     */
    private function decodeJsonPayload(string $content): ?array
    {
        $decoded = json_decode($content, true);
        if (! is_array($decoded)) {
            $jsonCandidate = $this->extractJsonFromText($content);
            $decoded = json_decode($jsonCandidate, true);
        }

        if (! is_array($decoded)) {
            return null;
        }

        $title = trim((string) ($decoded['title'] ?? ''));
        $summary = trim((string) ($decoded['summary'] ?? ''));
        $body = $this->stripSourceFooter(trim((string) ($decoded['content'] ?? '')));
        $topic = trim((string) ($decoded['topic'] ?? 'news'));

        if ($title === '' || $body === '') {
            return null;
        }

        return [
            'title' => Str::limit($title, 140, ''),
            'summary' => Str::limit($summary, 240, ''),
            'content' => Str::limit($body, 14000, ''),
            'topic' => Str::limit($topic, 60, ''),
            'categories' => $this->normalizeCategories($decoded['categories'] ?? [$topic]),
        ];
    }

    private function extractJsonFromText(string $content): string
    {
        if (preg_match('/\{.*\}/s', $content, $matches) === 1) {
            return $matches[0];
        }

        return $content;
    }

    /**
     * Fallback robusto per modelli locali che a volte ignorano il formato JSON.
     *
     * @return array<string, mixed>|null
     */
    private function decodePlainTextPayload(string $content, string $sourceTitle, string $sourceUrl): ?array
    {
        $plain = trim(strip_tags($content));
        $plain = preg_replace('/\s+/', ' ', $plain) ?? $plain;
        $plain = trim($plain);

        if ($plain === '' || Str::length($plain) < 120) {
            return null;
        }

        $titleFromText = Str::of($plain)->before('.')->trim()->toString();
        $title = $titleFromText !== '' ? $titleFromText : $sourceTitle;

        return [
            'title' => Str::limit($title, 140, ''),
            'summary' => Str::limit($plain, 240, ''),
            'content' => Str::limit($this->stripSourceFooter($plain), 14000, ''),
            'topic' => 'news',
            'categories' => ['news'],
        ];
    }

    private function stripSourceFooter(string $content): string
    {
        $clean = preg_replace('/(?:\s*\n\s*)*fonte\s*:\s*https?:\/\/\S+\s*$/iu', '', $content) ?? $content;
        $clean = preg_replace('/(?:\s*\n\s*)*fonte\s*:\s*.+\s*$/iu', '', $clean) ?? $clean;

        return trim($clean);
    }

    /**
     * @param mixed $categories
     * @return array<int, string>
     */
    private function normalizeCategories(mixed $categories): array
    {
        if (! is_array($categories)) {
            return [];
        }

        return collect($categories)
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->map(fn ($value) => Str::limit($value, 120, ''))
            ->unique(fn ($value) => mb_strtolower($value))
            ->values()
            ->take(3)
            ->all();
    }
}
