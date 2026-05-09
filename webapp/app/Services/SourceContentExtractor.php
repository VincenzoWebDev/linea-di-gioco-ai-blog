<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SourceContentExtractor
{
    /**
     * @return array{content: string|null, error: string|null}
     */
    public function extract(string $url): array
    {
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return ['content' => null, 'error' => 'invalid_url'];
        }

        $response = Http::timeout(12)
            ->withHeaders([
                'User-Agent' => 'LineaDiGiocoBot/1.0 (+https://lineadigioco.local)',
            ])
            ->get($url);

        if (! $response->successful()) {
            return ['content' => null, 'error' => 'fetch_failed'];
        }

        $html = (string) $response->body();
        $text = $this->extractMainText($html);

        if (Str::length($text) < 160) {
            return ['content' => null, 'error' => 'content_too_short'];
        }

        return ['content' => $text, 'error' => null];
    }

    private function extractMainText(string $html): string
    {
        $clean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', ' ', $html) ?? $html;
        $clean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', ' ', $clean) ?? $clean;

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($clean);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $nodes = $xpath->query('//article//p | //main//p | //p');

        $chunks = [];
        if ($nodes !== false) {
            foreach ($nodes as $node) {
                $txt = trim(preg_replace('/\s+/', ' ', $node->textContent) ?? '');
                if (Str::length($txt) >= 40) {
                    $chunks[] = $txt;
                }
            }
        }

        return Str::limit(trim(implode("\n\n", $chunks)), 12000, '');
    }
}

