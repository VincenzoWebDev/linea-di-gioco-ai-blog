<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ArticleImageFallbackService
{
    /**
     * @return array{bytes: string, mime: string}|null
     */
    public function fetchFromSourceUrl(string $sourceUrl): ?array
    {
        $sourceUrl = trim($sourceUrl);
        if ($sourceUrl === '' || ! filter_var($sourceUrl, FILTER_VALIDATE_URL)) {
            return null;
        }

        $timeout = max(5, (int) config('ai_news.images.timeout_seconds', 60));

        try {
            $pageResponse = Http::timeout($timeout)
                ->withHeaders(['User-Agent' => 'LineaDiGiocoBot/1.0'])
                ->get($sourceUrl);
            if (! $pageResponse->successful()) {
                return null;
            }
        } catch (\Throwable) {
            return null;
        }

        $html = (string) $pageResponse->body();
        if ($html === '') {
            return null;
        }

        $imageUrl = $this->extractImageUrlFromHtml($html, $sourceUrl);
        if (! $imageUrl) {
            return null;
        }

        try {
            $imageResponse = Http::timeout($timeout)
                ->withHeaders(['User-Agent' => 'LineaDiGiocoBot/1.0'])
                ->accept('image/*')
                ->get($imageUrl);
            if (! $imageResponse->successful()) {
                return null;
            }
        } catch (\Throwable) {
            return null;
        }

        $mime = strtolower(trim((string) $imageResponse->header('Content-Type', 'image/jpeg')));
        if (! str_starts_with($mime, 'image/')) {
            return null;
        }

        $bytes = (string) $imageResponse->body();
        if ($bytes === '') {
            return null;
        }

        return [
            'bytes' => $bytes,
            'mime' => $mime,
        ];
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    public function placeholder(string $title, string $variant = 'cover'): array
    {
        $isThumb = $variant === 'thumb';
        $width = $isThumb ? 512 : 1200;
        $height = $isThumb ? 512 : 630;
        $safeTitle = htmlspecialchars(mb_strimwidth(trim($title), 0, 80, '...'), ENT_QUOTES | ENT_XML1, 'UTF-8');
        $fontSize = $isThumb ? 24 : 36;

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 0 {$width} {$height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="45%" text-anchor="middle" fill="#e2e8f0" font-size="{$fontSize}" font-family="Arial, sans-serif" font-weight="700">
    Linea di Gioco
  </text>
  <text x="50%" y="58%" text-anchor="middle" fill="#94a3b8" font-size="{$fontSize}" font-family="Arial, sans-serif">
    {$safeTitle}
  </text>
</svg>
SVG;

        return [
            'bytes' => $svg,
            'mime' => 'image/svg+xml',
        ];
    }

    private function extractImageUrlFromHtml(string $html, string $baseUrl): ?string
    {
        $patterns = [
            '/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/i',
            '/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']/i',
            '/<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']/i',
            '/<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image["\']/i',
            '/<link[^>]+rel=["\']image_src["\'][^>]+href=["\']([^"\']+)["\']/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches) === 1) {
                $candidate = trim((string) ($matches[1] ?? ''));
                if ($candidate !== '') {
                    return $this->toAbsoluteUrl($candidate, $baseUrl);
                }
            }
        }

        return null;
    }

    private function toAbsoluteUrl(string $candidate, string $baseUrl): ?string
    {
        if (filter_var($candidate, FILTER_VALIDATE_URL)) {
            return $candidate;
        }

        $base = parse_url($baseUrl);
        if (! is_array($base) || empty($base['scheme']) || empty($base['host'])) {
            return null;
        }

        $scheme = $base['scheme'];
        $host = $base['host'];
        $port = isset($base['port']) ? ':'.$base['port'] : '';

        if (str_starts_with($candidate, '//')) {
            return "{$scheme}:{$candidate}";
        }

        if (str_starts_with($candidate, '/')) {
            return "{$scheme}://{$host}{$port}{$candidate}";
        }

        $path = (string) ($base['path'] ?? '/');
        $dir = rtrim(str_replace('\\', '/', dirname($path)), '/');
        $prefix = $dir === '' ? '' : "{$dir}/";

        return "{$scheme}://{$host}{$port}/{$prefix}{$candidate}";
    }
}

