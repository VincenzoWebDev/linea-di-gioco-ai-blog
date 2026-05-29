<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        return $this->index();
    }

    public function index(): Response
    {
        $sitemaps = collect([
            [
                'loc' => route('sitemap.pages'),
                'lastmod' => now()->toAtomString(),
            ],
            [
                'loc' => route('sitemap.posts'),
                'lastmod' => $this->latestPublishedArticleUpdatedAt(),
            ],
            [
                'loc' => route('sitemap.news'),
                'lastmod' => $this->latestNewsArticlePublishedAt(),
            ],
        ])->values();

        $xml = view('seo.sitemap-index', [
            'sitemaps' => $sitemaps,
        ])->render();

        return $this->xmlResponse($xml);
    }

    public function pages(): Response
    {
        $latestArchiveArticle = Article::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->latest('updated_at')
            ->first(['updated_at']);

        $pages = collect([
            [
                'loc' => route('home'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'hourly',
                'priority' => '1.0',
            ],
            [
                'loc' => route('blog.articles.index'),
                'lastmod' => $latestArchiveArticle?->updated_at?->toAtomString(),
                'changefreq' => 'hourly',
                'priority' => '0.9',
            ],
            [
                'loc' => route('newsletter'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.5',
            ],
            [
                'loc' => route('about'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'yearly',
                'priority' => '0.4',
            ],
            [
                'loc' => route('contact'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.5',
            ],
            [
                'loc' => route('privacy-policy'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'yearly',
                'priority' => '0.3',
            ],
            [
                'loc' => route('cookie-policy'),
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'yearly',
                'priority' => '0.3',
            ],
        ]);

        $xml = view('seo.sitemap', [
            'urls' => $pages,
        ])->render();

        return $this->xmlResponse($xml);
    }

    public function posts(): Response
    {
        $articles = Article::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->orderByDesc('published_at')
            ->get(['id', 'slug', 'published_at', 'updated_at'])
            ->map(fn (Article $article) => [
                'loc' => route('blog.articles.show', [
                    'id' => $article->id,
                    'slug' => $article->slug,
                ]),
                'lastmod' => ($article->updated_at ?? $article->published_at)?->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.8',
            ]);

        $xml = view('seo.sitemap', [
            'urls' => $articles,
        ])->render();

        return $this->xmlResponse($xml);
    }

    public function news(): Response
    {
        $windowHours = max(1, (int) config('seo.news_sitemap_window_hours', 48));

        $articles = Article::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->whereBetween('published_at', [now()->subHours($windowHours), now()])
            ->orderByDesc('published_at')
            ->limit(1000)
            ->get(['id', 'title', 'slug', 'published_at', 'updated_at'])
            ->map(fn (Article $article) => [
                'loc' => route('blog.articles.show', [
                    'id' => $article->id,
                    'slug' => $article->slug,
                ]),
                'lastmod' => ($article->updated_at ?? $article->published_at)?->toAtomString(),
                'publication_name' => config('seo.organization_name', config('seo.site_name', 'Linea di gioco')),
                'publication_language' => config('seo.news_sitemap_language', 'it'),
                'publication_date' => $article->published_at?->toAtomString(),
                'title' => $article->title,
            ]);

        $xml = view('seo.news-sitemap', [
            'urls' => $articles,
        ])->render();

        return $this->xmlResponse($xml);
    }

    private function latestPublishedArticleUpdatedAt(): ?string
    {
        $article = Article::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->latest('updated_at')
            ->first(['updated_at', 'published_at']);

        return ($article?->updated_at ?? $article?->published_at)?->toAtomString();
    }

    private function latestNewsArticlePublishedAt(): ?string
    {
        $windowHours = max(1, (int) config('seo.news_sitemap_window_hours', 48));

        $article = Article::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->whereBetween('published_at', [now()->subHours($windowHours), now()])
            ->latest('published_at')
            ->first(['published_at']);

        return $article?->published_at?->toAtomString();
    }

    private function xmlResponse(string $xml): Response
    {
        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
