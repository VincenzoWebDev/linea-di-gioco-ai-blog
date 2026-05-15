<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class CrewAiClient
{
    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|null
     */
    public function process(array $payload): ?array
    {
        if (! (bool) config('ai_news.crewai.enabled', false)) {
            return null;
        }

        $baseUrl = rtrim((string) config('ai_news.crewai.base_url', 'http://127.0.0.1:8001'), '/');
        $endpoint = (string) config('ai_news.crewai.endpoint', '/process');
        $timeout = (int) config('ai_news.crewai.timeout_seconds', 120);
        $apiKey = (string) config('ai_news.crewai.api_key', '');

        try {
            $request = Http::timeout($timeout)->acceptJson();
            if ($apiKey !== '') {
                $request = $request->withToken($apiKey);
            }

            $response = $request->post($baseUrl.$endpoint, [
                'title' => (string) ($payload['title'] ?? ''),
                'summary' => (string) ($payload['summary'] ?? ''),
                'source_content' => (string) ($payload['source_content'] ?? ''),
                'source_url' => (string) ($payload['source_url'] ?? ''),
                'language' => 'it',
                'domain' => 'geopolitics',
                'instructions' => [
                    'write_only_in_italian' => true,
                    'allowed_scope' => 'geopolitics, diplomacy, security, war, energy, elections, international institutions',
                    'blocked_scope' => 'sports, football, basketball, entertainment, gossip, lifestyle',
                ],
            ]);

            if (! $response->successful()) {
                return null;
            }

            $json = $response->json();
            if (! is_array($json)) {
                return null;
            }

            $article = data_get($json, 'article');
            if (! is_array($article)) {
                return null;
            }

            $title = trim((string) ($article['title'] ?? ''));
            $summary = trim((string) ($article['summary'] ?? ''));
            $content = $this->stripSourceFooter(trim((string) ($article['content'] ?? '')));
            $topic = trim((string) ($article['topic'] ?? 'geopolitica'));
            $categories = collect((array) ($article['categories'] ?? []))
                ->map(fn ($value) => trim((string) $value))
                ->filter(fn ($value) => $value !== '')
                ->values()
                ->take(5)
                ->all();
            $sourceUrl = trim((string) ($article['source_url'] ?? $payload['source_url'] ?? ''));
            $geopoliticalTension = is_array($article['geopolitical_tension'] ?? null)
                ? $article['geopolitical_tension']
                : null;

            if ($title === '' || $content === '') {
                return null;
            }

            $result = [
                'title' => Str::limit($title, 140, ''),
                'summary' => Str::limit($summary, 240, ''),
                'content' => Str::limit($content, 14000, ''),
                'topic' => Str::limit($topic, 60, ''),
                'categories' => $categories,
                'quality_score' => (float) ($article['quality_score'] ?? 0),
                'source_url' => $sourceUrl,
                'rewrite_mode' => 'crewai',
            ];
            if ($geopoliticalTension !== null) {
                $result['geopolitical_tension'] = $geopoliticalTension;
            }

            return $result;
        } catch (Throwable) {
            return null;
        }
    }

    private function stripSourceFooter(string $content): string
    {
        $clean = preg_replace('/(?:\s*\n\s*)*fonte\s*:\s*https?:\/\/\S+\s*$/iu', '', $content) ?? $content;
        $clean = preg_replace('/(?:\s*\n\s*)*fonte\s*:\s*.+\s*$/iu', '', $clean) ?? $clean;

        return trim($clean);
    }
}
