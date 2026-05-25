<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $latestArchiveArticle = Article::query()
            ->where('status', 'published')
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
            ]
        ]);

        $articles = Article::query()
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->get(['id', 'slug', 'published_at', 'updated_at'])
            ->map(fn(Article $article) => [
                'loc' => route('blog.articles.show', [
                    'id' => $article->id,
                    'slug' => $article->slug,
                ]),
                'lastmod' => ($article->updated_at ?? $article->published_at)?->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.8',
            ]);

        $xml = view('seo.sitemap', [
            'urls' => $pages->concat($articles)->values(),
        ])->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
