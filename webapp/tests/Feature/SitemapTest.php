<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Support\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_index_links_dedicated_sitemaps(): void
    {
        Article::query()->create([
            'title' => 'Analisi sul Mar Rosso',
            'slug' => 'analisi-mar-rosso',
            'summary' => 'Un riepilogo delle tensioni nel Mar Rosso.',
            'content' => 'Contenuto di test per la sitemap.',
            'status' => 'published',
            'created_by' => 'admin',
            'published_at' => now()->subHour(),
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee('<sitemapindex', false);
        $response->assertSee(route('sitemap.pages'), false);
        $response->assertSee(route('sitemap.posts'), false);
        $response->assertSee(route('sitemap.news'), false);
    }

    public function test_pages_sitemap_includes_public_pages(): void
    {
        $response = $this->get('/sitemap-pages.xml');

        $response->assertOk();
        $response->assertSee(route('home'), false);
        $response->assertSee(route('blog.articles.index'), false);
        $response->assertSee(route('newsletter'), false);
        $response->assertSee(route('about'), false);
    }

    public function test_posts_sitemap_includes_only_published_articles(): void
    {
        $publishedArticle = Article::query()->create([
            'title' => 'Analisi sul Mar Rosso',
            'slug' => 'analisi-mar-rosso',
            'summary' => 'Un riepilogo delle tensioni nel Mar Rosso.',
            'content' => 'Contenuto di test per la sitemap.',
            'status' => 'published',
            'created_by' => 'admin',
            'published_at' => now()->subHour(),
        ]);

        $draftArticle = Article::query()->create([
            'title' => 'Bozza sul Pacifico',
            'slug' => 'bozza-pacifico',
            'summary' => 'Una bozza non pubblicata.',
            'content' => 'Contenuto non indicizzabile.',
            'status' => 'draft',
            'created_by' => 'admin',
            'published_at' => now()->subHour(),
        ]);

        $response = $this->get('/sitemap-posts.xml');

        $response->assertOk();
        $response->assertSee(route('blog.articles.show', [
            'id' => $publishedArticle->id,
            'slug' => $publishedArticle->slug,
        ]), false);
        $response->assertDontSee(route('blog.articles.show', [
            'id' => $draftArticle->id,
            'slug' => $draftArticle->slug,
        ]), false);
    }

    public function test_news_sitemap_includes_only_recent_published_articles(): void
    {
        Carbon::setTestNow('2026-05-29 12:00:00');

        $recentArticle = Article::query()->create([
            'title' => 'Crisi diplomatica nel Caucaso',
            'slug' => 'crisi-diplomatica-caucaso',
            'summary' => 'Aggiornamento recente.',
            'content' => 'Contenuto recente.',
            'status' => 'published',
            'created_by' => 'admin',
            'published_at' => now()->subHours(6),
            'updated_at' => now()->subHours(2),
        ]);

        $oldArticle = Article::query()->create([
            'title' => 'Dossier superato',
            'slug' => 'dossier-superato',
            'summary' => 'Articolo vecchio.',
            'content' => 'Contenuto vecchio.',
            'status' => 'published',
            'created_by' => 'admin',
            'published_at' => now()->subDays(3),
        ]);

        $futureArticle = Article::query()->create([
            'title' => 'Dossier programmato',
            'slug' => 'dossier-programmato',
            'summary' => 'Articolo futuro.',
            'content' => 'Contenuto futuro.',
            'status' => 'published',
            'created_by' => 'admin',
            'published_at' => now()->addHour(),
        ]);

        $response = $this->get('/news-sitemap.xml');

        $response->assertOk();
        $response->assertSee('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"', false);
        $response->assertSee('<news:name>Linea di gioco</news:name>', false);
        $response->assertSee('<news:language>it</news:language>', false);
        $response->assertSee('<news:title>Crisi diplomatica nel Caucaso</news:title>', false);
        $response->assertSee('<news:publication_date>'.$recentArticle->published_at->toAtomString().'</news:publication_date>', false);
        $response->assertSee('<lastmod>'.$recentArticle->updated_at->toAtomString().'</lastmod>', false);
        $response->assertSee(route('blog.articles.show', [
            'id' => $recentArticle->id,
            'slug' => $recentArticle->slug,
        ]), false);
        $response->assertDontSee(route('blog.articles.show', [
            'id' => $oldArticle->id,
            'slug' => $oldArticle->slug,
        ]), false);
        $response->assertDontSee(route('blog.articles.show', [
            'id' => $futureArticle->id,
            'slug' => $futureArticle->slug,
        ]), false);

        Carbon::setTestNow();
    }
}
