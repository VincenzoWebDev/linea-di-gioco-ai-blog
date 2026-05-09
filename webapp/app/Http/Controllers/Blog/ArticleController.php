<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        $articles = Article::query()
            ->where('status', 'published')
            ->with('categories:id,name')
            ->latest('published_at')
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
            ->map(function (Article $article) {
                $categoryNames = $article->categories->pluck('name')->values();
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'summary' => $article->summary,
                    'excerpt' => $article->summary ?: Str::limit(strip_tags($article->content), 220),
                    'topic' => $categoryNames->first() ?: null,
                    'published_at' => optional($article->published_at)->toISOString(),
                    'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
                    'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
                ];
            })
            ->values();

        return Inertia::render('Blog/Articles/Index', [
            'articles' => $articles,
        ]);
    }

    public function show(int $id, string $slug): Response|RedirectResponse
    {
        $article = Article::query()
            ->where('status', 'published')
            ->with('categories:id,name')
            ->findOrFail($id, [
                'id',
                'title',
                'slug',
                'summary',
                'content',
                'published_at',
                'cover_path',
                'thumb_path',
            ]);

        if ($article->slug !== $slug) {
            return redirect()->route('blog.articles.show', [
                'id' => $article->id,
                'slug' => $article->slug,
            ]);
        }

        $related = Article::query()
            ->where('status', 'published')
            ->where('id', '!=', $article->id)
            ->with('categories:id,name')
            ->latest('published_at')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'published_at', 'thumb_path'])
            ->map(function (Article $item) {
                $categoryNames = $item->categories->pluck('name')->values();
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'slug' => $item->slug,
                    'topic' => $categoryNames->first() ?: null,
                    'published_at' => optional($item->published_at)->toISOString(),
                    'thumb_url' => $item->thumb_path ? Storage::url($item->thumb_path) : null,
                ];
            })
            ->values();

        return Inertia::render('Blog/Articles/Show', [
            'article' => [
                'categories' => $article->categories->pluck('name')->values(),
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'summary' => $article->summary,
                'content' => $article->content,
                'topic' => $article->categories->pluck('name')->first(),
                'published_at' => optional($article->published_at)->toISOString(),
                'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
                'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
            ],
            'related' => $related,
        ]);
    }
}
