<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_includes_public_pages_and_published_articles(): void
    {
        $article = Article::query()->create([
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
        $response->assertSee(route('home'), false);
        $response->assertSee(route('blog.articles.index'), false);
        $response->assertSee(route('newsletter'), false);
        $response->assertSee(route('blog.articles.show', [
            'id' => $article->id,
            'slug' => $article->slug,
        ]), false);
    }
}
