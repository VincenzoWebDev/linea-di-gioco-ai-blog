<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\GeopoliticalTension;
use App\Services\ArticleInsightService;
use App\Services\GeopoliticalTensionService;
use App\Support\GeopoliticalSeverity;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly ArticleInsightService $articleInsightService,
        private readonly GeopoliticalTensionService $geopoliticalTensionService,
    ) {}

    public function index(): Response
    {
        $publishedArticles = Article::query()
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
            ]);

        $tensions = GeopoliticalTension::query()
            ->whereIn('featured_article_id', $publishedArticles->pluck('id'))
            ->get([
                'featured_article_id',
                'risk_score',
                'trend_direction',
                'region_name',
                'updated_at',
            ])
            ->keyBy('featured_article_id');

        $articles = $publishedArticles
            ->map(fn(Article $article) => $this->toArticleCardData($article, $tensions->get($article->id)))
            ->values();

        $operations = $this->commandLocations();
        $activeOperations = $operations
            ->where('current_tension', '>', 0)
            ->values();
        $historicalOperations = $operations
            ->where('current_tension', '=', 0)
            ->values();
        $featuredArticle = $activeOperations->first() ?? $articles->first();
        $fallbackArticle = $articles->first();
        $latestPublishedAt = $featuredArticle['published_at']
            ?? ($fallbackArticle['published_at'] ?? null);

        return Inertia::render('Welcome', [
            'featuredArticle' => $featuredArticle,
            'locations' => $activeOperations,
            'historicalOperations' => $historicalOperations->take(6)->values(),
            'latestArticles' => $articles,
            'stats' => [
                'articlesCount' => Article::query()->where('status', 'published')->count(),
                'categoriesCount' => Category::query()->count(),
                'latestPublishedAt' => $latestPublishedAt,
                'hotspotsCount' => $activeOperations->count(),
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

    public function contact(): Response
    {
        return Inertia::render('Blog/Contact');
    }

    private function toArticleCardData(Article $article, ?GeopoliticalTension $tension = null): array
    {
        $categoryNames = $article->categories->pluck('name')->values();
        $summary = $this->articleInsightService->normalizeSummary(
            (string) $article->summary,
            (string) $article->content,
            (string) $article->title
        );
        $currentTension = $tension
            ? (int) ($this->geopoliticalTensionService->decaySnapshot($tension)['current_tension'] ?? $tension->risk_score ?? 0)
            : null;

        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'summary' => $summary,
            'excerpt' => $summary !== '' ? $summary : Str::limit(strip_tags($article->content), 180),
            'topic' => $categoryNames->first() ?: null,
            'categories' => $categoryNames,
            'published_at' => optional($article->published_at)->toISOString(),
            'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
            'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
            'quality_score' => $article->quality_score !== null ? (float) $article->quality_score : null,
            'operation_code' => sprintf('OP-%04d', $article->id),
            'severity' => $currentTension !== null
                ? GeopoliticalSeverity::fromRiskScore($currentTension)
                : 'low',
            'risk_score' => $tension?->risk_score,
            'current_tension' => $currentTension,
            'trend_direction' => $tension?->trend_direction ?? 'stable',
            'region_name' => $tension?->region_name,
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function commandLocations()
    {
        return GeopoliticalTension::query()
            ->with('featuredArticle:id,title,slug,status,published_at,summary,content,quality_score,thumb_path,cover_path')
            ->get()
            ->map(function (GeopoliticalTension $tension) {
                $decay = $this->geopoliticalTensionService->decaySnapshot($tension);
                $coordinates = $this->coordinatesForTension($tension);
                $regionName = $this->geopoliticalTensionService->normalizeRegionName(
                    (string) $tension->region_name,
                    $tension->featuredArticle
                );
                if ($coordinates === null && $decay['current_tension'] > 0) {
                    return null;
                }

                $article = $tension->featuredArticle;

                return [
                    'id' => $tension->id,
                    'region_name' => $regionName !== '' ? $regionName : $tension->region_name,
                    'lat' => $coordinates['lat'] ?? null,
                    'long' => $coordinates['long'] ?? null,
                    'risk_score' => $decay['current_tension'],
                    'initial_risk_score' => $decay['initial_risk_score'],
                    'current_tension' => $decay['current_tension'],
                    'severity' => \App\Support\GeopoliticalSeverity::fromRiskScore($decay['current_tension']),
                    'trend_direction' => $tension->trend_direction,
                    'status_label' => $tension->status_label,
                    'silence_hours' => $decay['silence_hours'],
                    'decay_days' => $decay['decay_days'],
                    'radio_silence_label' => $decay['radio_silence_label'],
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
                    'title' => $article?->title ?? $tension->region_name,
                    'summary' => $article?->summary ?? $tension->status_label,
                    'published_at' => optional($article?->published_at)->toISOString(),
                    'thumb_url' => $article?->thumb_path ? Storage::url($article->thumb_path) : null,
                    'cover_url' => $article?->cover_path ? Storage::url($article->cover_path) : null,
                    'url' => $article && $article->status === 'published'
                        ? route('blog.articles.show', [
                            'id' => $article->id,
                            'slug' => $article->slug,
                        ])
                        : null,
                ];
            })
            ->filter()
            ->sortBy([
                ['current_tension', 'desc'],
                ['silence_hours', 'asc'],
                ['region_name', 'asc'],
            ])
            ->take(12)
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

        return $this->geopoliticalTensionService->resolveCoordinates(
            (string) $tension->region_name,
            $tension->featuredArticle
        );
    }
}
