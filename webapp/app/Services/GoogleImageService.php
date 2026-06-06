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
        $location  = (string) config('services.google.location') ?: 'global';

        if ($projectId === '' || $location === '') {
            throw new RuntimeException('missing_google_config');
        }

        $token = app(GoogleAuthService::class)->getAccessToken();
        if (!is_string($token) || $token === '') {
            throw new RuntimeException('missing_google_access_token');
        }

        $model = 'gemini-3.1-flash-image';

        // Fix per global endpoint
        $host = ($location === 'global') ? 'aiplatform.googleapis.com' : "{$location}-aiplatform.googleapis.com";

        $url = sprintf(
            'https://%s/v1/projects/%s/locations/%s/publishers/google/models/%s:generateContent',
            $host,
            $projectId,
            $location,
            $model
        );

        $prompt = $this->buildPrompt($title, $summary);

        $response = Http::withToken($token)
            ->timeout(180)
            ->acceptJson()
            ->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $prompt]]
                    ]
                ],
                'generationConfig' => [
                    'responseModalities' => ['TEXT', 'IMAGE'],
                    'imageConfig' => [
                        'aspectRatio' => '16:9',
                        'imageSize'   => '1K'
                    ],
                    'candidateCount' => 1,
                    'temperature'    => 0.8,
                ],
                'safetySettings' => [
                    ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                    ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                ]
            ]);

        if (!$response->successful()) {
            Log::error('gemini_image_generation_failed', [
                'status'   => $response->status(),
                'url' => $url,
                'response' => mb_substr($response->body(), 0, 1500),
            ]);
            throw new RuntimeException('gemini_http_error_' . $response->status());
        }

        $data = $response->json();
        $parts = $data['candidates'][0]['content']['parts'] ?? [];

        $imagePart = null;
        foreach ($parts as $part) {
            if (isset($part['inlineData']['data'])) {
                $imagePart = $part['inlineData'];
                break;
            }
        }

        if (!$imagePart || empty($imagePart['data'])) {
            throw new RuntimeException('gemini_no_image_returned');
        }

        $base64 = $imagePart['data'];
        $mime   = $imagePart['mimeType'] ?? 'image/png';

        $binary = base64_decode($base64, true);
        if ($binary === false) {
            throw new RuntimeException('gemini_invalid_base64');
        }

        Log::info('gemini_image_generated_successfully', ['model' => $model]);

        return [
            'bytes' => $binary,     // ← Formato compatibile con il tuo vecchio codice
            'mime'  => $mime,
        ];
    }

    private function buildPrompt(string $title, string $summary): string
    {
        return trim(
            'Photorealistic geopolitical editorial news image. ' .
                'Wide cinematic composition, professional news cover style. ' .
                'Documentary photography, real-world geopolitical tension. ' .
                'High realism, natural lighting, 35mm photojournalism look. ' .
                'Strict constraints: no text, no logos, no watermarks. ' .
                'Global press agency aesthetic. ' .
                "Scene: {$summary}. Headline: {$title}."
        );
    }
}
