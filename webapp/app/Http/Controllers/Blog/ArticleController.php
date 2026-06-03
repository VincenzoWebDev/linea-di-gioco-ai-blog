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
                'last_event_at',
                'updated_at',
            ])
            ->keyBy('featured_article_id');

        $articles = $published->getCollection()
            ->map(function (Article $article) use ($tensions) {
                $categoryNames = $article->categories->pluck('name')->values();
                $tension = $tensions->get($article->id);
                $currentTension = $tension
                    ? (int) (app(GeopoliticalTensionService::class)->lifecycleSnapshot($tension)['current_tension'] ?? $tension->risk_score ?? 0)
                    : null;
                $trendDirection = $tension
                    ? app(GeopoliticalTensionService::class)->resolveTrendDirection($tension)
                    : 'stable';
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
                    'severity' => $currentTension !== null
                        ? GeopoliticalSeverity::fromRiskScore($currentTension)
                        : 'low',
                    'risk_score' => $tension?->risk_score,
                    'current_tension' => $currentTension,
                    'trend_direction' => $trendDirection,
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
            ->first(['region_name', 'display_region_name', 'region_key', 'risk_score', 'trend_direction', 'status_label', 'last_event_at', 'updated_at']);
        $lifecycle = $tension ? $geopoliticalTensionService->lifecycleSnapshot($tension) : null;
        $trendDirection = $tension ? $geopoliticalTensionService->resolveTrendDirection($tension) : 'stable';
        $resolvedRegionName = $tension
            ? $geopoliticalTensionService->normalizeRegionName($tension->region_name, $article)
            : null;
        $futureScenarios = $articleInsightService->normalizeStoredFutureScenarios($article->future_scenarios);
        $related = $this->buildRelatedArticles($article, $tension);
        $internalLinks = $this->buildInternalLinkGroups($article, $tension);

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
                    'display_region_name' => $tension->display_region_name ?: $resolvedRegionName ?: $tension->region_name,
                    'region_key' => $tension->region_key,
                    'risk_score' => $tension->risk_score,
                    'trend_direction' => $trendDirection,
                    'status_label' => $tension->status_label,
                    'updated_at' => optional($tension->updated_at)->toISOString(),
                    'current_tension' => $lifecycle['current_tension'] ?? $tension->risk_score,
                    'initial_risk_score' => $lifecycle['initial_risk_score'] ?? $tension->risk_score,
                    'silence_hours' => $lifecycle['silence_hours'] ?? 0,
                    'ttl_hours' => $lifecycle['ttl_hours'] ?? 48,
                    'expires_at' => $lifecycle['expires_at'] ?? null,
                    'is_expired' => $lifecycle['is_expired'] ?? false,
                    'radio_silence_label' => $lifecycle['radio_silence_label'] ?? null,
                ] : null,
            ],
            'related' => $related,
            'internalLinks' => $internalLinks,
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
            ->get(['featured_article_id', 'region_name', 'display_region_name'])
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
                $candidateTension = $tensionsByArticleId->get($candidate->id);
                $candidateRegion = mb_strtolower(trim((string) ($candidateTension?->region_name ?? '')));
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
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function buildInternalLinkGroups(Article $article, ?GeopoliticalTension $tension): array
    {
        $currentCategoryNames = $article->categories
            ->pluck('name')
            ->map(fn ($value) => mb_strtolower((string) $value))
            ->values();
        $currentRegion = mb_strtolower(trim((string) $tension?->region_name));

        $tensionsByArticleId = GeopoliticalTension::query()
            ->whereNotNull('featured_article_id')
            ->get(['featured_article_id', 'region_name'])
            ->keyBy('featured_article_id');

        $candidates = Article::query()
            ->where('status', 'published')
            ->where('id', '!=', $article->id)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->with('categories:id,name')
            ->latest('published_at')
            ->limit(60)
            ->get(['id', 'title', 'slug', 'summary', 'content', 'published_at'])
            ->map(function (Article $candidate) use ($currentCategoryNames, $currentRegion, $tensionsByArticleId) {
                $categoryNames = $candidate->categories->pluck('name')->values();
                $candidateRegion = trim((string) ($tensionsByArticleId->get($candidate->id)?->region_name ?? ''));
                $candidateRegionKey = mb_strtolower($candidateRegion);
                $candidateText = implode(' ', array_filter([
                    $candidate->title,
                    $candidate->summary,
                    Str::limit(strip_tags((string) $candidate->content), 900, ''),
                ]));
                $sharedCategories = $categoryNames
                    ->map(fn ($value) => mb_strtolower((string) $value))
                    ->filter(fn ($value) => $currentCategoryNames->contains($value))
                    ->values();

                return [
                    'id' => $candidate->id,
                    'title' => $candidate->title,
                    'slug' => $candidate->slug,
                    'summary' => Str::limit((string) $candidate->summary, 130),
                    'published_at' => optional($candidate->published_at)->toISOString(),
                    'region_name' => $candidateRegion !== '' ? $candidateRegion : null,
                    'topic' => $categoryNames->first() ?: null,
                    '_same_region' => $this->matchesRegion($currentRegion, $candidateRegionKey, $candidateText),
                    '_shared_categories' => $sharedCategories->all(),
                ];
            });

        $sameArea = $candidates
            ->filter(fn (array $item) => $item['_same_region'])
            ->take(3)
            ->map(fn (array $item) => $this->cleanInternalLinkItem($item, 'Stessa area geopolitica'))
            ->values()
            ->all();

        $sameCategory = $candidates
            ->filter(fn (array $item) => $item['_shared_categories'] !== [])
            ->take(3)
            ->map(fn (array $item) => $this->cleanInternalLinkItem(
                $item,
                'Categoria: '.Str::title((string) $item['_shared_categories'][0])
            ))
            ->values()
            ->all();

        $previousEvents = $candidates
            ->filter(fn (array $item) => $item['_same_region'])
            ->filter(fn (array $item) => $article->published_at === null || ($item['published_at'] ?? null) < $article->published_at->toISOString())
            ->take(3)
            ->map(fn (array $item) => $this->cleanInternalLinkItem($item, 'Evento precedente'))
            ->values()
            ->all();

        return [
            'area' => $sameArea,
            'categories' => $sameCategory,
            'previous' => $previousEvents,
        ];
    }

    private function matchesRegion(string $currentRegion, string $candidateRegion, string $candidateText): bool
    {
        if ($currentRegion === '') {
            return false;
        }

        if ($candidateRegion !== '' && $currentRegion === $candidateRegion) {
            return true;
        }

        $text = Str::lower($candidateText);
        $regionTokens = collect(preg_split('/[^\pL\pN]+/u', $currentRegion) ?: [])
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => mb_strlen($value) >= 4)
            ->values();

        return $regionTokens->contains(fn ($token) => str_contains($text, $token));
    }

    /**
     * @param array<string, mixed> $item
     * @return array<string, mixed>
     */
    private function cleanInternalLinkItem(array $item, string $reason): array
    {
        unset($item['_same_region'], $item['_shared_categories']);

        $item['match_reason'] = $reason;

        return $item;
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
