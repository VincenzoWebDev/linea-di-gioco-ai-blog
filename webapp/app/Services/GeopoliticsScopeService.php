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

        if ($this->containsConfiguredKeyword($text, (array) config('ai_news.scope.block_keywords', []))) {
            return false;
        }

        $normalizedUrl = mb_strtolower(trim((string) $url));
        $trusted = $this->isTrustedDomain($normalizedUrl, (array) config('ai_news.scope.trusted_domains', []));

        if ($this->containsConfiguredKeyword($text, (array) config('ai_news.scope.allow_keywords', []))) {
            return true;
        }

        if (! $trusted) {
            return false;
        }

        return $this->containsConfiguredKeyword($normalizedUrl, [
            'world',
            'politics',
            'international',
            'diplom',
            'security',
            'war',
            'conflict',
            'europe',
            'middle-east',
            'middle_east',
            'china',
            'taiwan',
            'russia',
            'ukraine',
            'nato',
            'sanctions',
            'energy',
            'election',
            'elections',
            'government',
            'foreign-policy',
            'foreign_policy',
        ]);
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

    /**
     * @param array<int, string> $keywords
     */
    private function containsConfiguredKeyword(string $text, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            $needle = mb_strtolower(trim((string) $keyword));
            if ($needle !== '' && str_contains($text, $needle)) {
                return true;
            }
        }

        return false;
    }
}
