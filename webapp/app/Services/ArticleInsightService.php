<?php

namespace App\Services;

use App\Support\ArticleContentNormalizer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class ArticleInsightService
{
    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function enrichPayload(array $payload): array
    {
        $payload['summary'] = $this->normalizeSummary(
            (string) ($payload['summary'] ?? ''),
            (string) ($payload['content'] ?? ''),
            (string) ($payload['title'] ?? '')
        );

        $payload['future_scenarios'] = $this->normalizeFutureScenarios(
            $payload['future_scenarios'] ?? null,
            $payload
        );

        return $payload;
    }

    public function normalizeSummary(string $summary, string $content, string $title = ''): string
    {
        $candidate = $this->cleanInlineText($summary);

        if ($candidate === '' || mb_strlen($candidate) < 40) {
            $candidate = $this->firstMeaningfulSentence($content);
        }

        if ($candidate === '') {
            $candidate = $this->cleanInlineText($title);
        }

        $candidate = trim($candidate);
        if ($candidate === '') {
            return '';
        }

        if (mb_strlen($candidate) > 240) {
            $candidate = $this->trimToSentenceBoundary($candidate, 240);
        }

        $candidate = rtrim($candidate, " \t\n\r\0\x0B,;:-");

        if (! preg_match('/[.!?]$/u', $candidate)) {
            $candidate .= '.';
        }

        return Str::limit($candidate, 240, '');
    }

    /**
     * @param mixed $raw
     * @param array<string, mixed> $payload
     * @return array<int, string>
     */
    public function normalizeFutureScenarios(mixed $raw, array $payload): array
    {
        $existing = collect(is_array($raw) ? $raw : [])
            ->map(fn ($value) => $this->normalizeScenarioLine((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->take(3)
            ->all();

        if ($existing !== []) {
            return $existing;
        }

        $generated = $this->generateFutureScenariosWithAi($payload);
        if ($generated !== []) {
            return $generated;
        }

        return $this->fallbackFutureScenarios($payload);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<int, string>
     */
    public function buildArticleFutureScenarios(array $payload): array
    {
        return $this->normalizeFutureScenarios($payload['future_scenarios'] ?? null, $payload);
    }

    /**
     * @param mixed $raw
     * @return array<int, string>
     */
    public function normalizeStoredFutureScenarios(mixed $raw): array
    {
        return collect(is_array($raw) ? $raw : [])
            ->map(fn ($value) => $this->normalizeScenarioLine((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->take(3)
            ->all();
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<int, string>
     */
    private function generateFutureScenariosWithAi(array $payload): array
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

        $title = trim((string) ($payload['title'] ?? ''));
        $summary = trim((string) ($payload['summary'] ?? ''));
        $content = trim((string) ($payload['content'] ?? ''));
        $tension = is_array($payload['geopolitical_tension'] ?? null)
            ? $payload['geopolitical_tension']
            : [];
        $region = trim((string) (
            $tension['display_region_name']
            ?? $tension['region_name']
            ?? $payload['display_region_name']
            ?? $payload['region_name']
            ?? ''
        ));
        $riskScore = (int) ($tension['risk_score'] ?? $payload['risk_score'] ?? 0);
        $trend = trim((string) ($tension['trend_direction'] ?? $payload['trend_direction'] ?? 'stable'));

        $systemPrompt = 'Sei un analista geopolitico. Scrivi solo in italiano. Formula scenari futuri prudenti, concreti, verificabili e coerenti con la notizia. Non inventare fatti non presenti.';
        $userPrompt = <<<PROMPT
Restituisci solo JSON valido con chiave:
- future_scenarios: array di 2 frasi brevi in italiano.

Regole:
- Ogni frase deve essere autonoma, chiusa da un punto e di senso compiuto.
- Max 140 caratteri per frase.
- Tono analitico, non sensazionalistico.
- Usa formule probabilistiche o condizionali, non certezze assolute.
- Basati solo sui dati qui sotto.

INPUT
Titolo: {$title}
Sottotitolo: {$summary}
Area: {$region}
Risk score: {$riskScore}
Trend: {$trend}
Contenuto:
{$content}
PROMPT;

        try {
            $raw = $provider === 'openai'
                ? $this->openAiContent($baseUrl, $model, $systemPrompt, $userPrompt)
                : $this->ollamaContent($baseUrl, $model, $systemPrompt, $userPrompt);

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

            return collect((array) ($decoded['future_scenarios'] ?? []))
                ->map(fn ($value) => $this->normalizeScenarioLine((string) $value))
                ->filter()
                ->unique()
                ->values()
                ->take(3)
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<int, string>
     */
    private function fallbackFutureScenarios(array $payload): array
    {
        $summary = $this->normalizeSummary(
            (string) ($payload['summary'] ?? ''),
            (string) ($payload['content'] ?? ''),
            (string) ($payload['title'] ?? '')
        );
        $region = trim((string) (
            data_get($payload, 'geopolitical_tension.display_region_name')
            ?? data_get($payload, 'geopolitical_tension.region_name')
            ?? $payload['display_region_name']
            ?? $payload['region_name']
            ?? $payload['topic']
            ?? 'l’area monitorata'
        ));
        $riskScore = (int) (
            data_get($payload, 'geopolitical_tension.risk_score')
            ?? $payload['risk_score']
            ?? 0
        );
        $trend = trim((string) (
            data_get($payload, 'geopolitical_tension.trend_direction')
            ?? $payload['trend_direction']
            ?? 'stable'
        ));

        $pressureLine = match (true) {
            $riskScore >= 80 => "Nelle prossime ore {$region} potrebbe registrare ulteriore pressione operativa o diplomatica, se i segnali descritti nel dossier verranno confermati.",
            $riskScore >= 60 => "Il quadro su {$region} potrebbe irrigidirsi rapidamente, soprattutto se i canali politici e di sicurezza non produrranno segnali di stabilizzazione.",
            default => "Su {$region} il contesto resta osservabile, ma nuovi sviluppi politici o militari potrebbero modificare il profilo di rischio nel breve periodo.",
        };

        $trendLine = match ($trend) {
            'rising' => "Se la traiettoria resterà in salita, saranno decisivi i prossimi aggiornamenti sul terreno e le reazioni degli attori regionali.",
            'falling' => "Se la traiettoria discendente verrà confermata, il dossier potrebbe spostarsi verso una fase di contenimento più che di escalation immediata.",
            default => "La traiettoria appare ancora interlocutoria e richiede conferme successive prima di parlare di svolta strutturale.",
        };

        $summaryLine = $summary !== ''
            ? "Il punto da monitorare resta questo: {$this->trimToSentenceBoundary($summary, 120)}"
            : '';

        return collect([$pressureLine, $trendLine, $summaryLine])
            ->map(fn ($value) => $this->normalizeScenarioLine((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->take(3)
            ->all();
    }

    private function firstMeaningfulSentence(string $content): string
    {
        $plain = $this->cleanInlineText(ArticleContentNormalizer::stripSourceFooter(strip_tags($content)));
        if ($plain === '') {
            return '';
        }

        if (preg_match('/^(.{40,240}?[.!?])(?:\s|$)/u', $plain, $matches) === 1) {
            return trim($matches[1]);
        }

        return $this->trimToSentenceBoundary($plain, 220);
    }

    private function trimToSentenceBoundary(string $text, int $max): string
    {
        $normalized = $this->cleanInlineText($text);
        if (mb_strlen($normalized) <= $max) {
            return $normalized;
        }

        $slice = mb_substr($normalized, 0, $max);

        if (preg_match('/^(.+[.!?])[^.!?]*$/u', $slice, $matches) === 1) {
            return trim($matches[1]);
        }

        if (preg_match('/^(.+)\s+\S*$/u', $slice, $matches) === 1) {
            return trim($matches[1]);
        }

        return trim($slice);
    }

    private function normalizeScenarioLine(string $text): string
    {
        $line = $this->cleanInlineText($text);
        if ($line === '') {
            return '';
        }

        if (mb_strlen($line) > 160) {
            $line = $this->trimToSentenceBoundary($line, 160);
        }

        $line = rtrim($line, " \t\n\r\0\x0B,;:-");
        if (! preg_match('/[.!?]$/u', $line)) {
            $line .= '.';
        }

        return $line;
    }

    private function cleanInlineText(string $text): string
    {
        $text = strip_tags($text);
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;

        return trim($text);
    }

    private function ollamaContent(string $baseUrl, string $model, string $systemPrompt, string $userPrompt): string
    {
        $response = Http::timeout((int) config('ai_news.ai.timeout_seconds', 30))
            ->acceptJson()
            ->post($baseUrl.'/api/chat', [
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
            ->post($baseUrl.'/chat/completions', [
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
}
