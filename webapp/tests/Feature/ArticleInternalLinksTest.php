<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\GeopoliticalTension;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ArticleInternalLinksTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_page_exposes_internal_links_by_area_category_and_previous_events(): void
    {
        $category = Category::query()->create([
            'name' => 'Sicurezza',
            'slug' => 'sicurezza',
        ]);

        $currentArticle = $this->publishedArticle('Dossier Taiwan e deterrenza regionale', 'dossier-taiwan', now());
        $previousArticle = $this->publishedArticle('Taiwan e pressione militare nello Stretto', 'taiwan-pressione-militare', now()->subDays(2));
        $categoryArticle = $this->publishedArticle('Sicurezza energetica nel Mar Rosso', 'sicurezza-energetica-mar-rosso', now()->subDay());

        $currentArticle->categories()->sync([$category->id]);
        $previousArticle->categories()->sync([$category->id]);
        $categoryArticle->categories()->sync([$category->id]);

        GeopoliticalTension::query()->create([
            'region_name' => 'Stretto di Taiwan',
            'risk_score' => 58,
            'trend_direction' => 'stable',
            'status_label' => 'Monitoraggio',
            'featured_article_id' => $currentArticle->id,
            'updated_at' => now(),
        ]);

        $response = $this->get(route('blog.articles.show', [
                'id' => $currentArticle->id,
                'slug' => $currentArticle->slug,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Blog/Articles/Show')
            ->where('internalLinks.area.0.title', $previousArticle->title)
            ->where('internalLinks.area.0.match_reason', 'Stessa area geopolitica')
            ->where('internalLinks.previous.0.title', $previousArticle->title)
            ->where('internalLinks.previous.0.match_reason', 'Evento precedente')
            ->where('internalLinks.categories.0.match_reason', 'Categoria: Sicurezza'));
    }

    private function publishedArticle(string $title, string $slug, $publishedAt): Article
    {
        return Article::query()->create([
            'title' => $title,
            'slug' => $slug,
            'summary' => 'Sintesi del contesto geopolitico.',
            'content' => 'Contenuto di test per i link interni tra dossier correlati.',
            'status' => 'published',
            'created_by' => 'admin',
            'published_at' => $publishedAt,
        ]);
    }
}
