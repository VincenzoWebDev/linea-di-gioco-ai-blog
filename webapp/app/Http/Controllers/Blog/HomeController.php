<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $articles = Article::query()
            ->where('status', 'published')
            ->with('categories:id,name')
            ->latest('published_at')
            ->limit(7)
            ->get([
                'id',
                'title',
                'slug',
                'summary',
                'content',
                'published_at',
                'cover_path',
                'thumb_path',
            ])
            ->map(fn (Article $article) => $this->toArticleCardData($article))
            ->values();

        $featuredArticle = $articles->first();
        $spotlightArticle = $articles->skip(1)->first();
        $latestArticles = $articles->skip(1)->take(3)->values();
        $briefingArticles = $articles->take(4)->values();
        $latestPublishedAt = $featuredArticle['published_at'] ?? null;

        return Inertia::render('Welcome', [
            'featuredArticle' => $featuredArticle,
            'spotlightArticle' => $spotlightArticle,
            'latestArticles' => $latestArticles,
            'briefingArticles' => $briefingArticles,
            'stats' => [
                'articlesCount' => Article::query()->where('status', 'published')->count(),
                'categoriesCount' => Category::query()->count(),
                'latestPublishedAt' => $latestPublishedAt,
            ],
        ]);
    }

    public function newsletter(): Response
    {
        return Inertia::render('Blog/Newsletter', [
            'stats' => [
                'articlesCount' => Article::query()->where('status', 'published')->count(),
                'categoriesCount' => Category::query()->count(),
            ],
        ]);
    }

    private function toArticleCardData(Article $article): array
    {
        $categoryNames = $article->categories->pluck('name')->values();

        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'summary' => $article->summary,
            'excerpt' => $article->summary ?: Str::limit(strip_tags($article->content), 180),
            'topic' => $categoryNames->first() ?: null,
            'published_at' => optional($article->published_at)->toISOString(),
            'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
            'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
        ];
    }
}
