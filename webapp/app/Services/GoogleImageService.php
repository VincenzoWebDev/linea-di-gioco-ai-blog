<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GoogleImageService
{
    /**
     * @return array{bytes: string, mime: string}
     */
    public function generate(
        string $title,
        string $summary
    ): array {
        $projectId = (string) config('services.google.project_id');
        $location = (string) config('services.google.location');

        if ($projectId === '' || $location === '') {
            throw new RuntimeException('missing_google_config');
        }

        $token = app(GoogleAuthService::class)->getAccessToken();

        if (! is_string($token) || $token === '') {
            throw new RuntimeException('missing_google_access_token');
        }

        $url = sprintf(
            'https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/imagen-4.0-ultra-generate-001:predict',
            $location,
            $projectId,
            $location
        );

        $prompt = $this->buildPrompt($title, $summary);

        $attempts = max((int) config('ai_news.images.retry_attempts', 1), 1);
        $sleepMs = max((int) config('ai_news.images.retry_sleep_ms', 1500), 0);
        $response = null;

        for ($i = 1; $i <= $attempts; $i++) {
            $response = Http::withToken($token)
                ->timeout(120)
                ->acceptJson()
                ->post($url, [
                    'instances' => [
                        ['prompt' => $prompt]
                    ],
                    'parameters' => [
                        'sampleCount' => 1,
                    ]
                ]);

            if ($response->successful()) {
                break;
            }

            $status = $response->status();
            $shouldRetry = in_array($status, [429, 500, 502, 503, 504], true) && $i < $attempts;

            Log::warning('google_image_generation_http_failed', [
                'attempt' => $i,
                'attempts' => $attempts,
                'status' => $status,
                'retrying' => $shouldRetry,
                'response_excerpt' => mb_substr($response->body(), 0, 500),
            ]);

            if (! $shouldRetry) {
                break;
            }

            if ($sleepMs > 0) {
                usleep($sleepMs * 1000);
            }
        }

        if (! $response || ! $response->successful()) {
            throw new RuntimeException(
                'imagen_http_error_' . ($response?->status() ?? 0)
            );
        }

        $prediction = $response->json('predictions.0');

        if (! is_array($prediction)) {
            throw new RuntimeException('imagen_invalid_response');
        }

        $base64 = $prediction['bytesBase64Encoded'] ?? null;

        if (! is_string($base64) || $base64 === '') {
            throw new RuntimeException('imagen_missing_base64');
        }

        $binary = base64_decode($base64, true);

        if ($binary === false) {
            throw new RuntimeException('imagen_invalid_base64');
        }

        $mime = $prediction['mimeType'] ?? 'image/png';

        if (! str_starts_with($mime, 'image/')) {
            $mime = 'image/png';
        }

        return [
            'bytes' => $binary,
            'mime' => $mime,
        ];
    }

    private function buildPrompt(
        string $title,
        string $summary
    ): string {
        return trim(
            'Photorealistic geopolitical editorial news image. ' .
                'Wide cinematic composition, professional news cover style. ' .
                'Documentary photography, real-world geopolitical tension. ' .
                'High realism, natural lighting, 35mm photojournalism look. ' .
                'Strict constraints: no text, no logos, no watermarks. ' .
                'No distorted flags, no fictional maps, no recognizable public figures. ' .
                'Global press agency aesthetic (Reuters / AP style). ' .
                "Scene context: {$summary}. " .
                "Headline context: {$title}."
        );
    }
}
