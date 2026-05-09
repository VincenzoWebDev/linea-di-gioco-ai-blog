<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;

class CategoryAssignmentService
{
    /**
     * @return array<int, int>
     */
    public function resolveCategoryIds(
        ?string $title = null,
        ?string $summary = null,
        ?string $content = null,
        array $suggestedCategories = []
    ): array {
        $categories = Category::query()
            ->where('is_active', true)
            ->get(['id', 'name', 'slug']);

        $suggestedIds = $this->resolveSuggestedCategoryIds($suggestedCategories, $categories);
        if ($suggestedIds !== []) {
            return $suggestedIds;
        }

        if ($categories->isEmpty()) {
            return [];
        }

        $text = Str::lower(trim(implode(' ', array_filter([
            $title,
            $summary,
            Str::limit((string) $content, 800, ''),
        ]))));

        if ($text === '') {
            return [(int) $categories->first()->id];
        }

        $scored = [];
        foreach ($categories as $category) {
            $score = 0;
            $name = Str::lower((string) $category->name);
            $slug = Str::lower((string) $category->slug);
            if ($name !== '' && str_contains($text, $name)) {
                $score += 3;
            }
            if ($slug !== '' && str_contains($text, $slug)) {
                $score += 2;
            }
            foreach (explode('-', $slug) as $token) {
                $token = trim($token);
                if (strlen($token) >= 4 && str_contains($text, $token)) {
                    $score += 1;
                }
            }
            if ($score > 0) {
                $scored[] = ['id' => (int) $category->id, 'score' => $score];
            }
        }

        if ($scored !== []) {
            usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);
            $top = array_slice($scored, 0, 3);
            return array_values(array_unique(array_map(fn ($item) => $item['id'], $top)));
        }

        $fallback = $categories->firstWhere('slug', 'geopolitica')
            ?? $categories->firstWhere('name', 'Geopolitica')
            ?? $categories->first();

        return $fallback ? [(int) $fallback->id] : [];
    }

    /**
     * @param array<int, string> $suggestedCategories
     * @param \Illuminate\Support\Collection<int, Category> $activeCategories
     * @return array<int, int>
     */
    private function resolveSuggestedCategoryIds(array $suggestedCategories, $activeCategories): array
    {
        $normalized = collect($suggestedCategories)
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->map(fn ($value) => Str::limit($value, 120, ''))
            ->filter(function ($value) {
                $key = mb_strtolower(trim((string) $value));
                return ! in_array($key, ['news', 'notizie', 'varie', 'general', 'generale'], true);
            })
            ->unique(fn ($value) => mb_strtolower($value))
            ->values()
            ->take(3)
            ->all();

        if ($normalized === []) {
            return [];
        }

        $ids = [];
        foreach ($normalized as $name) {
            $slug = Str::slug($name);
            if ($slug === '') {
                continue;
            }

            $existing = $activeCategories->firstWhere('slug', $slug);
            if (! $existing) {
                $existing = Category::query()->firstWhere('slug', $slug);
            }

            if (! $existing) {
                $existing = Category::query()->create([
                    'name' => $this->toDisplayName($name),
                    'slug' => $this->uniqueSlug($slug),
                    'description' => null,
                    'is_active' => true,
                ]);
            }

            $ids[] = (int) $existing->id;
        }

        return array_values(array_unique($ids));
    }

    private function toDisplayName(string $value): string
    {
        $value = str_replace(['-', '_'], ' ', $value);
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return Str::title(trim($value));
    }

    private function uniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $attempt = 1;

        while (Category::query()->where('slug', $slug)->exists()) {
            $attempt++;
            $slug = $baseSlug.'-'.$attempt;
        }

        return $slug;
    }
}
