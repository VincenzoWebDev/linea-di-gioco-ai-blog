<?php

namespace App\Services;

class GeopoliticsScopeService
{
    public function isInScope(string $title, ?string $summary = null, ?string $url = null): bool
    {
        $text = mb_strtolower(trim($title.' '.($summary ?? '')));
        if ($text === '') {
            return false;
        }

        $block = config('ai_news.scope.block_keywords', []);
        foreach ($block as $keyword) {
            $needle = mb_strtolower(trim((string) $keyword));
            if ($needle !== '' && str_contains($text, $needle)) {
                return false;
            }
        }

        $trustedDomains = config('ai_news.scope.trusted_domains', []);
        if ($this->isTrustedDomain((string) $url, $trustedDomains)) {
            return true;
        }

        $allow = config('ai_news.scope.allow_keywords', []);
        foreach ($allow as $keyword) {
            $needle = mb_strtolower(trim((string) $keyword));
            if ($needle !== '' && str_contains($text, $needle)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<int, string> $trustedDomains
     */
    private function isTrustedDomain(string $url, array $trustedDomains): bool
    {
        if ($url === '') {
            return false;
        }

        $host = mb_strtolower((string) parse_url($url, PHP_URL_HOST));
        if ($host === '') {
            return false;
        }

        foreach ($trustedDomains as $domain) {
            $needle = mb_strtolower(trim($domain));
            if ($needle !== '' && str_ends_with($host, $needle)) {
                return true;
            }
        }

        return false;
    }
}
