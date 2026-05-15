<?php

namespace App\Support;

use Illuminate\Support\Str;

final class ArticleContentNormalizer
{
    public static function stripSourceFooter(string $content): string
    {
        $clean = preg_replace('/(?:\s*\n\s*)*fonte\s*:\s*https?:\/\/\S+\s*$/iu', '', $content) ?? $content;
        $clean = preg_replace('/(?:\s*\n\s*)*fonte\s*:\s*.+\s*$/iu', '', $clean) ?? $clean;

        return trim($clean);
    }

    public static function preferNonEmptyString(mixed ...$values): string
    {
        foreach ($values as $value) {
            $normalized = trim((string) $value);
            if ($normalized !== '') {
                return $normalized;
            }
        }

        return '';
    }

    /**
     * @param  mixed  $categories
     * @return array<int, string>
     */
    public static function normalizeCategories(mixed $categories, int $max = 5): array
    {
        if (! is_array($categories)) {
            return [];
        }

        return collect($categories)
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->map(fn ($value) => Str::limit($value, 120, ''))
            ->unique(fn ($value) => mb_strtolower($value))
            ->values()
            ->take($max)
            ->all();
    }
}
