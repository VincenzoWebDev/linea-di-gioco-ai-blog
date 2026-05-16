<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\GeopoliticalTension;
use App\Services\RegionCoordinateResolver;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly RegionCoordinateResolver $coordinateResolver
    ) {
    }

    public function index(): Response
    {
        $articles = Article::query()
            ->where('status', 'published')
            ->with('categories:id,name')
            ->latest('published_at')
            ->limit(10)
            ->get([
                'id',
                'title',
                'slug',
                'summary',
                'content',
                'published_at',
                'cover_path',
                'thumb_path',
                'quality_score',
            ])
            ->map(fn (Article $article) => $this->toArticleCardData($article))
            ->values();

        $locations = $this->commandLocations();
        $featuredArticle = $articles->first();
        $spotlightArticle = $articles->skip(1)->first();
        $latestArticles = $articles->skip(1)->take(6)->values();
        $briefingArticles = $articles->take(6)->values();
        $latestPublishedAt = $featuredArticle['published_at'] ?? null;

        return Inertia::render('Welcome', [
            'featuredArticle' => $featuredArticle,
            'spotlightArticle' => $spotlightArticle,
            'latestArticles' => $latestArticles,
            'briefingArticles' => $briefingArticles,
            'locations' => $locations,
            'tickerItems' => $locations->isNotEmpty() ? $locations : $articles->take(6)->values(),
            'stats' => [
                'articlesCount' => Article::query()->where('status', 'published')->count(),
                'categoriesCount' => Category::query()->count(),
                'latestPublishedAt' => $latestPublishedAt,
                'hotspotsCount' => $locations->count(),
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
            'categories' => $categoryNames,
            'published_at' => optional($article->published_at)->toISOString(),
            'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
            'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
            'quality_score' => $article->quality_score !== null ? (float) $article->quality_score : null,
            'operation_code' => sprintf('OP-%04d', $article->id),
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function commandLocations()
    {
        return GeopoliticalTension::query()
            ->with('featuredArticle:id,title,slug,status,published_at,summary,content,quality_score,thumb_path,cover_path')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderByDesc('risk_score')
            ->orderBy('region_name')
            ->limit(12)
            ->get()
            ->map(function (GeopoliticalTension $tension) {
                $coordinates = $this->coordinatesForTension($tension);
                if ($coordinates === null) {
                    return null;
                }

                $article = $tension->featuredArticle;

                return [
                    'id' => $tension->id,
                    'region_name' => $tension->region_name,
                    'lat' => $coordinates['lat'],
                    'long' => $coordinates['long'],
                    'risk_score' => $tension->risk_score,
                    'severity' => $this->severityFromRisk($tension->risk_score),
                    'trend_direction' => $tension->trend_direction,
                    'status_label' => $tension->status_label,
                    'updated_at' => optional($tension->updated_at)->toISOString(),
                    'operation_code' => sprintf('OP-%04d', $article?->id ?? $tension->id),
                    'article' => $article && $article->status === 'published' ? [
                        'id' => $article->id,
                        'title' => $article->title,
                        'slug' => $article->slug,
                        'summary' => $article->summary,
                        'published_at' => optional($article->published_at)->toISOString(),
                        'quality_score' => $article->quality_score !== null ? (float) $article->quality_score : null,
                        'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
                        'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
                        'url' => route('blog.articles.show', [
                            'id' => $article->id,
                            'slug' => $article->slug,
                        ]),
                    ] : null,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * @return array{lat: float, long: float}|null
     */
    private function coordinatesForTension(GeopoliticalTension $tension): ?array
    {
        if ($tension->hasMapCoordinates()) {
            return [
                'lat' => (float) $tension->latitude,
                'long' => (float) $tension->longitude,
            ];
        }

        $article = $tension->featuredArticle;
        $context = trim(implode(' ', array_filter([
            $article?->title,
            $article?->summary,
            $article?->content ? Str::limit(strip_tags($article->content), 500, '') : null,
        ])));

        return $this->coordinateResolver->resolve($tension->region_name, $context);
    }

    private function severityFromRisk(int $score): string
    {
        return match (true) {
            $score >= (int) config('ai_news.risk.severity_high', 80) => 'high',
            $score >= (int) config('ai_news.risk.severity_elevated', 60) => 'elevated',
            $score >= (int) config('ai_news.risk.severity_guarded', 40) => 'guarded',
            default => 'low',
        };
    }
}
