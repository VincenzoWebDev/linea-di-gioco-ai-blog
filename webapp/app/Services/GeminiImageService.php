<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiImageService
{
    /**
     * @return array{bytes: string, mime: string}
     */
    public function generate(string $title, string $summary, string $variant = 'cover'): array
    {
        $apiKey = (string) config('ai_news.images.api_key', '');
        $baseUrl = rtrim((string) config('ai_news.images.base_url', 'https://generativelanguage.googleapis.com'), '/');
        $model = (string) config('ai_news.images.model', 'gemini-2.5-flash-image-preview');
        $timeout = (int) config('ai_news.images.timeout_seconds', 60);
        $style = (string) config('ai_news.images.style', '');

        if ($apiKey === '') {
            throw new RuntimeException('missing_gemini_image_api_key');
        }

        $prompt = $this->buildPrompt($title, $summary, $variant, $style);
        $url = "{$baseUrl}/v1beta/models/{$model}:generateContent";

        $attempts = max(1, (int) config('ai_news.images.retry_attempts', 3));
        $sleepMs = max(250, (int) config('ai_news.images.retry_sleep_ms', 1500));
        $response = null;

        for ($i = 1; $i <= $attempts; $i++) {
            $response = Http::timeout(max(5, $timeout))
                ->acceptJson()
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                ])
                ->post($url, [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'responseModalities' => ['TEXT', 'IMAGE'],
                    ],
                    'safetySettings' => [
                        ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_ONLY_HIGH'],
                        ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                        ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                        ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ],
                ]);

            if ($response->successful()) {
                break;
            }

            if (! in_array($response->status(), [429, 500, 502, 503, 504], true) || $i === $attempts) {
                break;
            }

            usleep($sleepMs * 1000);
        }

        if (! $response || ! $response->successful()) {
            $status = $response ? $response->status() : 0;
            throw new RuntimeException('gemini_http_error_'.$status);
        }

        $data = $response->json();
        if (! is_array($data)) {
            throw new RuntimeException('gemini_invalid_response');
        }

        $parts = data_get($data, 'candidates.0.content.parts', []);
        if (! is_array($parts)) {
            throw new RuntimeException('gemini_missing_parts');
        }

        foreach ($parts as $part) {
            $inline = is_array($part) ? ($part['inlineData'] ?? null) : null;
            if (! is_array($inline)) {
                continue;
            }

            $encoded = (string) ($inline['data'] ?? '');
            $mime = (string) ($inline['mimeType'] ?? 'image/png');
            if ($encoded === '') {
                continue;
            }

            $bytes = base64_decode($encoded, true);
            if (! is_string($bytes) || $bytes === '') {
                continue;
            }

            return [
                'bytes' => $bytes,
                'mime' => str_starts_with($mime, 'image/') ? $mime : 'image/png',
            ];
        }

        throw new RuntimeException('gemini_no_image_part');
    }

    private function buildPrompt(string $title, string $summary, string $variant, string $style): string
    {
        $shape = $variant === 'thumb'
            ? 'Composizione quadrata per miniatura social/news.'
            : 'Composizione orizzontale da copertina editoriale.';

        return trim(
            'Crea una immagine fotorealistica editoriale per un articolo di geopolitica. '.
            $shape.' '.
            'Nessun logo, watermark, testo leggibile, bandiere inventate o volti di persone reali riconoscibili. '.
            ($style !== '' ? "Stile desiderato: {$style}. " : '').
            "Titolo: {$title}. ".
            "Descrizione: {$summary}."
        );
    }
}
