<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\ArticleGlossaryService;
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

                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'summary' => $article->summary,
                    'excerpt' => $article->summary ?: Str::limit(strip_tags($article->content), 220),
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
        ArticleGlossaryService $glossaryService
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

        $tension = GeopoliticalTension::query()
            ->where('featured_article_id', $article->id)
            ->first(['region_name', 'risk_score', 'trend_direction', 'status_label', 'updated_at']);

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
                'updated_at' => optional($article->updated_at)->toISOString(),
                'cover_url' => $article->cover_path ? Storage::url($article->cover_path) : null,
                'thumb_url' => $article->thumb_path ? Storage::url($article->thumb_path) : null,
                'source_url' => $article->source_url,
                'source_name' => $article->source_name,
                'quality_score' => $article->quality_score !== null ? (float) $article->quality_score : null,
                'tension' => $tension ? [
                    'region_name' => $tension->region_name,
                    'risk_score' => $tension->risk_score,
                    'trend_direction' => $tension->trend_direction,
                    'status_label' => $tension->status_label,
                    'updated_at' => optional($tension->updated_at)->toISOString(),
                ] : null,
            ],
            'related' => $related,
            'glossary' => $this->resolveGlossary($article, $glossaryService),
            'riskThresholds' => [
                'alertHigh' => (int) config('ai_news.risk.alert_high', 82),
                'alertElevated' => (int) config('ai_news.risk.alert_elevated', 62),
                'alertGuarded' => (int) config('ai_news.risk.alert_guarded', 42),
                'scenarioHigh' => 78,
            ],
            'newsArticleSchema' => $newsArticleSchemaService->make($article),
        ]);
    }

    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    private function resolveGlossary(Article $article, ArticleGlossaryService $glossaryService): array
    {
        $stored = $article->glossary;
        if (is_array($stored) && $stored !== []) {
            return $stored;
        }

        $generated = $glossaryService->build(
            (string) $article->title,
            (string) $article->content
        );

        if ($generated !== []) {
            $article->update(['glossary' => $generated]);
        }

        return $generated;
    }
}
