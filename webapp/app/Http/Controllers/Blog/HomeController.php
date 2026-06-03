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
            ->limit(6)
            ->get([
                'id',
                'title',
                'slug',
                'summary',
                'published_at',
                'cover_path',
                'thumb_path',
            ]);

        $tensions = GeopoliticalTension::query()
            ->whereIn('featured_article_id', $publishedArticles->pluck('id'))
            ->get([
                'featured_article_id',
                'risk_score',
                'trend_direction',
                'region_name',
                'last_event_at',
                'updated_at',
            ])
            ->keyBy('featured_article_id');

        $articles = $publishedArticles
            ->map(fn(Article $article) => $this->toArticleCardData($article, $tensions->get($article->id)))
            ->values();

        $operations = $this->commandLocations();
        $activeOperations = $operations
            ->where('is_expired', false)
            ->where('risk_score', '>=', (int) config('ai_news.tensions.min_active_risk_score', 30))
            ->take(6)
            ->values();
        $historicalOperations = $operations
            ->filter(fn(array $item) => (int) ($item['risk_score'] ?? 0) >= (int) config('ai_news.tensions.min_active_risk_score', 30))
            ->where('current_tension', '=', 0)
            ->take(5)
            ->values();
        $fallbackArticle = $articles->first();
        $latestPublishedAt = ($activeOperations->first()['published_at'] ?? null)
            ?? ($fallbackArticle['published_at'] ?? null);

        return Inertia::render('Welcome', [
            'locations' => $activeOperations,
            'historicalOperations' => $historicalOperations,
            'feedItems' => $activeOperations->isNotEmpty() ? $activeOperations : $articles->take(6)->values(),
            'latestItems' => $articles->take(3)->values(),
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

    public function about(): Response
    {
        return Inertia::render('Blog/About');
    }

    private function toArticleCardData(Article $article, ?GeopoliticalTension $tension = null): array
    {
        $categoryNames = $article->categories->pluck('name')->values();
        $summary = $this->articleInsightService->normalizeSummary(
            (string) $article->summary,
            '',
            (string) $article->title
        );
        $currentTension = $tension
            ? (int) ($this->geopoliticalTensionService->lifecycleSnapshot($tension)['current_tension'] ?? $tension->risk_score ?? 0)
            : null;
        $trendDirection = $tension
            ? $this->geopoliticalTensionService->resolveTrendDirection($tension)
            : 'stable';

        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'summary' => $summary,
            'excerpt' => $summary !== '' ? $summary : Str::limit($article->title, 180),
            'topic' => $categoryNames->first() ?: null,
            'published_at' => optional($article->published_at)->toISOString(),
            'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
            'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
            'url' => route('blog.articles.show', [
                'id' => $article->id,
                'slug' => $article->slug,
            ]),
            'operation_code' => sprintf('OP-%04d', $article->id),
            'severity' => $currentTension !== null
                ? GeopoliticalSeverity::fromRiskScore($currentTension)
                : 'low',
            'risk_score' => $tension?->risk_score,
            'current_tension' => $currentTension,
            'trend_direction' => $trendDirection,
            'region_name' => $tension?->region_name ?? ($categoryNames->first() ?: 'Dossier globale'),
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function commandLocations()
    {
        return GeopoliticalTension::query()
            ->with('featuredArticle:id,title,slug,status,published_at,summary,thumb_path,cover_path')
            ->get([
                'id',
                'featured_article_id',
                'region_name',
                'display_region_name',
                'region_key',
                'latitude',
                'longitude',
                'risk_score',
                'trend_direction',
                'status_label',
                'last_event_at',
                'updated_at',
            ])
            ->map(function (GeopoliticalTension $tension) {
                $lifecycle = $this->geopoliticalTensionService->lifecycleSnapshot($tension);
                $coordinates = $this->coordinatesForTension($tension);
                $regionName = $this->geopoliticalTensionService->normalizeRegionName(
                    (string) $tension->region_name,
                    $tension->featuredArticle
                );
                $displayRegionName = trim((string) ($tension->display_region_name ?? ''));

                $article = $tension->featuredArticle;
                $mapRiskScore = (int) $tension->risk_score;
                $displayTension = max((int) ($lifecycle['current_tension'] ?? 0), $mapRiskScore);

                return [
                    'id' => $tension->id,
                    'region_name' => $regionName !== '' ? $regionName : $tension->region_name,
                    'display_region_name' => $displayRegionName !== '' ? $displayRegionName : $regionName,
                    'region_key' => (string) ($tension->region_key ?? ''),
                    'lat' => $coordinates['lat'] ?? null,
                    'long' => $coordinates['long'] ?? null,
                    'risk_score' => $mapRiskScore,
                    'initial_risk_score' => $lifecycle['initial_risk_score'],
                    'current_tension' => $displayTension,
                    'severity' => \App\Support\GeopoliticalSeverity::fromRiskScore($displayTension),
                    'trend_direction' => $this->geopoliticalTensionService->resolveTrendDirection($tension),
                    'status_label' => $tension->status_label,
                    'silence_hours' => $lifecycle['silence_hours'],
                    'ttl_hours' => $lifecycle['ttl_hours'],
                    'expires_at' => $lifecycle['expires_at'],
                    'is_expired' => $lifecycle['is_expired'],
                    'radio_silence_label' => $lifecycle['radio_silence_label'],
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
                    'title' => $article?->title ?? ($displayRegionName !== '' ? $displayRegionName : $tension->region_name),
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
                ['display_region_name', 'asc'],
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
            (string) ($tension->display_region_name ?: $tension->region_name),
            $tension->featuredArticle
        );
    }
}
