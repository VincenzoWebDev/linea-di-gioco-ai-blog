<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\ArticleInsightService;
use App\Services\GeopoliticalTensionService;
use App\Support\GeopoliticalSeverity;
use App\Services\NewsArticleSchemaService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Pagination\LengthAwarePaginator;

class ArticleController extends Controller
{
    public function index(): Response
    {

        /** @var LengthAwarePaginator $published */
        $published = Article::query()
            ->where('status', 'published')
            ->with('categories:id,name')
            ->latest('published_at')
            ->paginate(9, [
                'id',
                'title',
                'slug',
                'summary',
                'content',
                'published_at',
                'cover_path',
                'thumb_path',
            ]);

        $tensions = GeopoliticalTension::query()
            ->whereIn('featured_article_id', $published->pluck('id'))
            ->get([
                'featured_article_id',
                'risk_score',
                'trend_direction',
                'region_name',
            ])
            ->keyBy('featured_article_id');

        $articles = $published->getCollection()
            ->map(function (Article $article) use ($tensions) {
                $categoryNames = $article->categories->pluck('name')->values();
                $tension = $tensions->get($article->id);
                $riskScore = $tension?->risk_score;
                $summary = app(ArticleInsightService::class)->normalizeSummary(
                    (string) $article->summary,
                    (string) $article->content,
                    (string) $article->title
                );

                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'summary' => $summary,
                    'excerpt' => $summary !== '' ? $summary : Str::limit(strip_tags($article->content), 220),
                    'topic' => $categoryNames->first() ?: null,
                    'categories' => $categoryNames,
                    'published_at' => optional($article->published_at)->toISOString(),
                    'cover_url' => $article->cover_path
                        ? Storage::url($article->cover_path)
                        : null,
                    'thumb_url' => $article->thumb_path
                        ? Storage::url($article->thumb_path)
                        : null,
                    'operation_code' => sprintf('OP-%04d', $article->id),
                    'severity' => $riskScore !== null
                        ? GeopoliticalSeverity::fromRiskScore((int) $riskScore)
                        : 'low',
                    'risk_score' => $riskScore,
                    'trend_direction' => $tension?->trend_direction ?? 'stable',
                    'region_name' => $tension?->region_name,
                ];
            });

        $published->setCollection($articles);

        return Inertia::render('Blog/Articles/Index', [
            'articles' => $published,
            'stats' => [
                'total' => $published->total(),
            ],
        ]);
    }

    public function show(
        int $id,
        string $slug,
        NewsArticleSchemaService $newsArticleSchemaService,
        GeopoliticalTensionService $geopoliticalTensionService,
        ArticleInsightService $articleInsightService
    ): Response|RedirectResponse {
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
                'updated_at',
                'cover_path',
                'thumb_path',
                'source_url',
                'source_name',
                'quality_score',
                'glossary',
                'future_scenarios',
            ]);

        if ($article->slug !== $slug) {
            return redirect()->route('blog.articles.show', [
                'id' => $article->id,
                'slug' => $article->slug,
            ]);
        }

        $tension = GeopoliticalTension::query()
            ->where('featured_article_id', $article->id)
            ->first(['region_name', 'risk_score', 'trend_direction', 'status_label', 'updated_at']);
        $decay = $tension ? $geopoliticalTensionService->decaySnapshot($tension) : null;
        $resolvedRegionName = $tension
            ? $geopoliticalTensionService->normalizeRegionName($tension->region_name, $article)
            : null;
        $futureScenarios = $articleInsightService->normalizeStoredFutureScenarios($article->future_scenarios);
        $related = $this->buildRelatedArticles($article, $tension);

        return Inertia::render('Blog/Articles/Show', [
            'article' => [
                'categories' => $article->categories->pluck('name')->values(),
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'summary' => $articleInsightService->normalizeSummary(
                    (string) $article->summary,
                    (string) $article->content,
                    (string) $article->title
                ),
                'content' => $article->content,
                'topic' => $article->categories->pluck('name')->first(),
                'published_at' => optional($article->published_at)->toISOString(),
                'updated_at' => optional($article->updated_at)->toISOString(),
                'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
                'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
                'source_url' => $article->source_url,
                'source_name' => $article->source_name,
                'quality_score' => $article->quality_score !== null ? (float) $article->quality_score : null,
                'future_scenarios' => $futureScenarios,
                'tension' => $tension ? [
                    'region_name' => $resolvedRegionName ?: $tension->region_name,
                    'risk_score' => $tension->risk_score,
                    'trend_direction' => $tension->trend_direction,
                    'status_label' => $tension->status_label,
                    'updated_at' => optional($tension->updated_at)->toISOString(),
                    'current_tension' => $decay['current_tension'] ?? $tension->risk_score,
                    'initial_risk_score' => $decay['initial_risk_score'] ?? $tension->risk_score,
                    'silence_hours' => $decay['silence_hours'] ?? 0,
                    'decay_days' => $decay['decay_days'] ?? 0,
                    'radio_silence_label' => $decay['radio_silence_label'] ?? null,
                ] : null,
            ],
            'related' => $related,
            'glossary' => $this->resolveGlossary($article),
            'riskThresholds' => [
                'severityHigh' => (int) config('ai_news.risk.severity_high', 80),
                'severityElevated' => (int) config('ai_news.risk.severity_elevated', 60),
                'severityGuarded' => (int) config('ai_news.risk.severity_guarded', 40),
                'scenarioHigh' => 78,
            ],
            'newsArticleSchema' => $newsArticleSchemaService->make($article),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildRelatedArticles(Article $article, ?GeopoliticalTension $tension): array
    {
        $currentCategoryNames = $article->categories
            ->pluck('name')
            ->map(fn ($value) => mb_strtolower((string) $value))
            ->values();
        $currentRegion = mb_strtolower(trim((string) $tension?->region_name));
        $currentKeywords = $this->extractSimilarityKeywords(
            implode(' ', array_filter([
                $article->title,
                $article->summary,
                Str::limit(strip_tags((string) $article->content), 1000, ''),
            ]))
        );

        $tensionsByArticleId = GeopoliticalTension::query()
            ->whereNotNull('featured_article_id')
            ->get(['featured_article_id', 'region_name'])
            ->keyBy('featured_article_id');

        return Article::query()
            ->where('status', 'published')
            ->where('id', '!=', $article->id)
            ->with('categories:id,name')
            ->latest('published_at')
            ->limit(30)
            ->get(['id', 'title', 'slug', 'summary', 'content', 'published_at', 'thumb_path'])
            ->map(function (Article $candidate) use ($currentCategoryNames, $currentKeywords, $currentRegion, $tensionsByArticleId) {
                $categoryNames = $candidate->categories->pluck('name')->values();
                $candidateRegion = mb_strtolower(trim((string) ($tensionsByArticleId->get($candidate->id)?->region_name ?? '')));
                $sharedCategories = $categoryNames
                    ->map(fn ($value) => mb_strtolower((string) $value))
                    ->filter(fn ($value) => $currentCategoryNames->contains($value))
                    ->values();
                $candidateKeywords = $this->extractSimilarityKeywords(
                    implode(' ', array_filter([
                        $candidate->title,
                        $candidate->summary,
                        Str::limit(strip_tags((string) $candidate->content), 700, ''),
                    ]))
                );
                $sharedKeywords = array_values(array_intersect($currentKeywords, $candidateKeywords));

                $score = 0;
                if ($currentRegion !== '' && $candidateRegion !== '' && $currentRegion === $candidateRegion) {
                    $score += 60;
                }

                $score += min($sharedCategories->count(), 3) * 18;
                $score += min(count($sharedKeywords), 5) * 6;

                return [
                    'id' => $candidate->id,
                    'title' => $candidate->title,
                    'slug' => $candidate->slug,
                    'topic' => $categoryNames->first() ?: null,
                    'published_at' => optional($candidate->published_at)->toISOString(),
                    'thumb_url' => $candidate->thumb_path ? Storage::url($candidate->thumb_path) : null,
                    'match_reason' => $this->matchReason($currentRegion, $candidateRegion, $sharedCategories->all(), $sharedKeywords),
                    '_score' => $score,
                ];
            })
            ->filter(fn (array $item) => $item['_score'] > 0)
            ->sortBy([
                ['_score', 'desc'],
                ['published_at', 'desc'],
            ])
            ->take(3)
            ->map(function (array $item) {
                unset($item['_score']);

                return $item;
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function extractSimilarityKeywords(string $text): array
    {
        $stopwords = [
            'della', 'delle', 'degli', 'dello', 'nella', 'nelle', 'negli', 'sulla', 'sulle',
            'dopo', 'prima', 'anche', 'mentre', 'questo', 'questa', 'quello', 'quella',
            'sono', 'come', 'dati', 'fonti', 'paese', 'paesi', 'stato', 'stati',
            'notizia', 'articolo', 'analisi', 'linea', 'gioco', 'dossier',
        ];

        return collect(preg_split('/[^\pL\pN]+/u', Str::lower($text)) ?: [])
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => mb_strlen($value) >= 5 && ! in_array($value, $stopwords, true))
            ->unique()
            ->values()
            ->take(12)
            ->all();
    }

    /**
     * @param array<int, string> $sharedCategories
     * @param array<int, string> $sharedKeywords
     */
    private function matchReason(string $currentRegion, string $candidateRegion, array $sharedCategories, array $sharedKeywords): string
    {
        if ($currentRegion !== '' && $candidateRegion !== '' && $currentRegion === $candidateRegion) {
            return 'Stessa area geopolitica monitorata';
        }

        if ($sharedCategories !== []) {
            return 'Categoria condivisa: '.Str::title((string) $sharedCategories[0]);
        }

        if ($sharedKeywords !== []) {
            return 'Tema comune: '.Str::headline((string) $sharedKeywords[0]);
        }

        return 'Contesto affine';
    }

    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    private function resolveGlossary(Article $article): array
    {
        $stored = $article->glossary;
        if (is_array($stored) && $stored !== []) {
            return $stored;
        }

        return [];
    }
}
