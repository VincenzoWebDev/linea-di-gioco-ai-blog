<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\GeopoliticalTension;
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
            ->with('featuredArticle:id,title,slug,status,published_at,summary,quality_score,thumb_path,cover_path')
            ->orderByDesc('risk_score')
            ->orderBy('region_name')
            ->limit(12)
            ->get()
            ->map(function (GeopoliticalTension $tension) {
                $coordinates = $this->coordinatesForRegion($tension->region_name);
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
    private function coordinatesForRegion(string $regionName): ?array
    {
        $region = $this->normalizeRegionName($regionName);
        $coordinates = [
            ['aliases' => ['russia ukraine', 'ukraine russia', 'russia-ukraine', 'ukraine-russia'], 'point' => ['lat' => 49.0, 'long' => 31.0]],
            ['aliases' => ['israel gaza', 'gaza israel', 'israele gaza', 'gaza striscia', 'gaza strip'], 'point' => ['lat' => 31.4, 'long' => 34.4]],
            ['aliases' => ['israel lebanon', 'israele libano', 'lebanon israel', 'libano israele'], 'point' => ['lat' => 33.3, 'long' => 35.3]],
            ['aliases' => ['middle east', 'medio oriente', 'levant'], 'point' => ['lat' => 33.0, 'long' => 44.0]],
            ['aliases' => ['indo pacifico', 'indo pacific', 'indo-pacifico', 'indo-pacific'], 'point' => ['lat' => 14.6, 'long' => 120.98]],
            ['aliases' => ['stati uniti', 'united states', 'usa', 'washington'], 'point' => ['lat' => 38.9072, 'long' => -77.0369]],
            ['aliases' => ['libano', 'lebanon', 'beirut'], 'point' => ['lat' => 33.8938, 'long' => 35.5018]],
            ['aliases' => ['ucraina', 'ukraine', 'kyiv', 'kiev'], 'point' => ['lat' => 50.4501, 'long' => 30.5234]],
            ['aliases' => ['russia', 'mosca', 'moscow'], 'point' => ['lat' => 55.7558, 'long' => 37.6173]],
            ['aliases' => ['cina', 'china', 'beijing', 'pechino'], 'point' => ['lat' => 39.9042, 'long' => 116.4074]],
            ['aliases' => ['taiwan', 'taipei'], 'point' => ['lat' => 25.0330, 'long' => 121.5654]],
            ['aliases' => ['israele', 'israel', 'jerusalem', 'gerusalemme'], 'point' => ['lat' => 31.7683, 'long' => 35.2137]],
            ['aliases' => ['iran', 'tehran', 'teheran'], 'point' => ['lat' => 35.6892, 'long' => 51.3890]],
            ['aliases' => ['gaza'], 'point' => ['lat' => 31.5017, 'long' => 34.4668]],
            ['aliases' => ['cuba', 'havana', 'avana'], 'point' => ['lat' => 23.1136, 'long' => -82.3666]],
            ['aliases' => ['sahel'], 'point' => ['lat' => 17.5707, 'long' => 3.9962]],
            ['aliases' => ['mediterraneo', 'mediterranean'], 'point' => ['lat' => 35.0, 'long' => 18.0]],
            ['aliases' => ['europa', 'europe', 'bruxelles', 'brussels'], 'point' => ['lat' => 50.8503, 'long' => 4.3517]],
            ['aliases' => ['africa'], 'point' => ['lat' => 9.0820, 'long' => 8.6753]],
            ['aliases' => ['asia'], 'point' => ['lat' => 34.0479, 'long' => 100.6197]],
        ];

        foreach ($coordinates as $entry) {
            foreach ($entry['aliases'] as $alias) {
                if (str_contains($region, $this->normalizeRegionName($alias))) {
                    return $entry['point'];
                }
            }
        }

        return null;
    }

    private function normalizeRegionName(string $value): string
    {
        $normalized = Str::of($value)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->trim()
            ->value();

        return preg_replace('/\s+/', ' ', $normalized) ?? $normalized;
    }

    private function severityFromRisk(int $score): string
    {
        return match (true) {
            $score >= 75 => 'high',
            $score >= 50 => 'elevated',
            $score >= 25 => 'guarded',
            default => 'low',
        };
    }
}
