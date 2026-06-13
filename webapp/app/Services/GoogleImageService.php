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
        $location = (string) config('services.google.location') ?: 'global';

        if ($projectId === '' || $location === '') {
            throw new RuntimeException('missing_google_config');
        }

        $token = app(GoogleAuthService::class)->getAccessToken();
        if (! is_string($token) || $token === '') {
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
                        'parts' => [['text' => $prompt]],
                    ],
                ],
                'generationConfig' => [
                    'responseModalities' => ['TEXT', 'IMAGE'],
                    'imageConfig' => [
                        'aspectRatio' => '16:9',
                        'imageSize' => '1K',
                    ],
                    'candidateCount' => 1,
                    'temperature' => 0.8,
                ],
                'safetySettings' => [
                    ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                    ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                ],
            ]);

        if (! $response->successful()) {
            Log::error('gemini_image_generation_failed', [
                'status' => $response->status(),
                'url' => $url,
                'response' => mb_substr($response->body(), 0, 1500),
            ]);
            throw new RuntimeException('gemini_http_error_'.$response->status());
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

        if (! $imagePart || empty($imagePart['data'])) {
            throw new RuntimeException('gemini_no_image_returned');
        }

        $base64 = $imagePart['data'];
        $mime = $imagePart['mimeType'] ?? 'image/png';

        $binary = base64_decode($base64, true);
        if ($binary === false) {
            throw new RuntimeException('gemini_invalid_base64');
        }

        Log::info('gemini_image_generated_successfully', ['model' => $model]);

        return [
            'bytes' => $binary,     // ← Formato compatibile con il tuo vecchio codice
            'mime' => $mime,
        ];
    }

    private function buildPrompt(string $title, string $summary): string
    {
        return "You are an expert editorial photojournalist for a global news agency. ".
            "Create a powerful, photorealistic documentary photograph representing this geopolitical event.\n\n".
            "EVENT CONTEXT (in Italian):\n".
            "Title: {$title}\n".
            "Summary: {$summary}\n\n".
            "VITAL DIRECTIVE - NO TEXT OVERLAYS:\n".
            "- Absolutely NO text, letters, words, alphabets, headlines, subtitles, titles, captions, typography, logos, watermarks, symbols, signatures, or badges.\n".
            "- The image must be a pure, clean, raw photograph. It is NOT a magazine cover, a designed poster, or a graphic layout. It must have NO graphic design elements, borders, or text of any kind.\n\n".
            "VISUAL STYLE GUIDELINES:\n".
            "- Style: Photorealistic editorial photojournalism, wide cinematic composition, dramatic natural lighting, 35mm camera look, high realism, documentary aesthetic, real-world geopolitical tension.\n".
            "- Scene translation: Translate the Italian Title and Summary above into a purely visual, symbolic, and concrete scene description in English (focusing on realistic environments, people, or symbolic objects related to the event, like a summit room, high-tech control room, cargo port, border post, industrial facility, etc. without depicting any literal text).\n\n".
            "Generate ONLY the image representing this pure visual scene. Do not include any text in the output image.";
    }
}
