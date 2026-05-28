<?php

namespace App\Services;

use App\Support\ArticleContentNormalizer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class CrewAiClient
{
    /**
     * @param  array<string, mixed>  $payload
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
                    'geopolitical_tension_region_rule' => 'Return the most specific stable geopolitical area supported by the article context. Avoid generic labels like "Area non specificata" when a country, sea, strait, border, or subregion can be inferred.',
                    'geopolitical_tension_risk_rule' => 'Risk score must be evidence-based and dynamic on a 1-100 scale. Use lower values for routine diplomacy, mid values for sanctions or force posture, and high values only for active escalation, strikes, mobilization, or severe crisis signals. Do not default to the same score across different stories.',
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
            $content = ArticleContentNormalizer::stripSourceFooter(trim((string) ($article['content'] ?? '')));
            $topic = trim((string) ($article['topic'] ?? 'geopolitica'));
            $categories = ArticleContentNormalizer::normalizeCategories($article['categories'] ?? []);
            $sourceUrl = ArticleContentNormalizer::preferUsableUrl(
                $article['source_url'] ?? null,
                $payload['source_url'] ?? null
            );
            if ($sourceUrl === '') {
                $sourceUrl = ArticleContentNormalizer::preferNonEmptyString(
                    $payload['source_url'] ?? null,
                    $article['source_url'] ?? null
                );
            }
            $geopoliticalTension = is_array($article['geopolitical_tension'] ?? null)
                ? $article['geopolitical_tension']
                : null;
            $futureScenarios = is_array($article['future_scenarios'] ?? null)
                ? $article['future_scenarios']
                : [];

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
                'future_scenarios' => $futureScenarios,
            ];
            if ($geopoliticalTension !== null) {
                $result['geopolitical_tension'] = $geopoliticalTension;
            }

            return $result;
        } catch (Throwable) {
            return null;
        }
    }
}
