<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\NewsArticleSchemaService;
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

    public function show(int $id, string $slug, NewsArticleSchemaService $newsArticleSchemaService): Response|RedirectResponse
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
                'updated_at',
                'cover_path',
                'thumb_path',
                'source_url',
                'source_name',
                'quality_score',
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
            'glossary' => $this->buildGlossary((string) $article->content),
            'newsArticleSchema' => $newsArticleSchemaService->make($article),
        ]);
    }

    /**
     * @return array<string, array{definition: string, importance: string}>
     */
    private function buildGlossary(string $content): array
    {
        $terms = [
            'NATO' => [
                'definition' => 'Alleanza militare transatlantica fondata sulla difesa collettiva tra Stati membri.',
                'importance' => 'Alta',
            ],
            'ONU' => [
                'definition' => 'Organizzazione internazionale che coordina diplomazia, sicurezza e cooperazione tra Stati.',
                'importance' => 'Alta',
            ],
            'Consiglio di Sicurezza' => [
                'definition' => 'Organo ONU responsabile di pace, sanzioni e missioni internazionali.',
                'importance' => 'Critica',
            ],
            'UE' => [
                'definition' => 'Unione politica ed economica europea con competenze su mercato, regole e diplomazia.',
                'importance' => 'Alta',
            ],
            'sanzioni' => [
                'definition' => 'Misure economiche o politiche usate per fare pressione su governi, aziende o individui.',
                'importance' => 'Alta',
            ],
            'deterrenza' => [
                'definition' => 'Strategia per scoraggiare un avversario mostrando costi militari o politici elevati.',
                'importance' => 'Alta',
            ],
            'proxy' => [
                'definition' => 'Attore locale sostenuto da una potenza esterna per influenzare un conflitto.',
                'importance' => 'Media',
            ],
            'escalation' => [
                'definition' => 'Aumento progressivo dell’intensita politica, militare o diplomatica di una crisi.',
                'importance' => 'Critica',
            ],
            'cessate il fuoco' => [
                'definition' => 'Interruzione temporanea o concordata delle ostilita tra parti in conflitto.',
                'importance' => 'Alta',
            ],
            'corridoio umanitario' => [
                'definition' => 'Passaggio protetto per civili, aiuti o evacuazioni in zone di conflitto.',
                'importance' => 'Alta',
            ],
            'Stretto di Hormuz' => [
                'definition' => 'Passaggio marittimo vitale tra Oman e Iran per il traffico petrolifero mondiale.',
                'importance' => 'Critica',
            ],
            'Mar Nero' => [
                'definition' => 'Area strategica tra Europa orientale, Caucaso e rotte commerciali verso il Mediterraneo.',
                'importance' => 'Alta',
            ],
            'Indo-Pacifico' => [
                'definition' => 'Quadrante strategico che collega Oceano Indiano, Pacifico e competizione tra potenze.',
                'importance' => 'Alta',
            ],
            'BRICS' => [
                'definition' => 'Gruppo di economie emergenti che coordina iniziative finanziarie e diplomatiche alternative.',
                'importance' => 'Media',
            ],
        ];

        $normalizedContent = Str::lower($content);

        return collect($terms)
            ->filter(fn (array $entry, string $term) => str_contains($normalizedContent, Str::lower($term)))
            ->take(8)
            ->all();
    }
}
