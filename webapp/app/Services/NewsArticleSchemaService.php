<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NewsArticleSchemaService
{
    /**
     * @return array<string, mixed>
     */
    public function make(Article $article): array
    {
        $categories = $article->categories
            ->pluck('name')
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->values();

        $url = route('blog.articles.show', [
            'id' => $article->id,
            'slug' => $article->slug,
        ]);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $url,
            ],
            'headline' => Str::limit($article->title, 110, ''),
            'description' => $article->summary ?: Str::limit(strip_tags($article->content), 220, ''),
            'datePublished' => optional($article->published_at)->toIso8601String(),
            'dateModified' => optional($article->updated_at)->toIso8601String(),
            'author' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'Linea di gioco'),
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'Linea di gioco'),
            ],
            'articleSection' => $categories->first() ?: 'Geopolitica',
            'keywords' => $categories->implode(', '),
            'inLanguage' => 'it-IT',
            'isAccessibleForFree' => true,
        ];

        $imageUrl = $this->absoluteImageUrl($article->cover_path ?: $article->thumb_path);
        if ($imageUrl !== null) {
            $schema['image'] = [$imageUrl];
        }

        if ($categories->isNotEmpty()) {
            $schema['about'] = $categories
                ->map(fn ($name) => [
                    '@type' => 'Thing',
                    'name' => $name,
                ])
                ->all();
        }

        return array_filter($schema, fn ($value) => $value !== null && $value !== '');
    }

    private function absoluteImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $url = Storage::url($path);

        return Str::startsWith($url, ['http://', 'https://']) ? $url : url($url);
    }
}
