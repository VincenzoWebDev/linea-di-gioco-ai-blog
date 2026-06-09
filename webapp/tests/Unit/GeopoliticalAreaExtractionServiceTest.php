<?php

namespace Tests\Unit;

use App\Models\Article;
use App\Services\GeopoliticalAreaExtractionService;
use App\Services\RegionCoordinateResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeopoliticalAreaExtractionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_uses_ollama_to_extract_country_and_specific_place(): void
    {
        config()->set('ai_news.ai.enabled', true);
        config()->set('ai_news.ai.base_url', 'http://127.0.0.1:11434');
        config()->set('ai_news.ai.model', 'llama3.1');

        Http::fake([
            'http://127.0.0.1:11434/api/chat' => Http::response([
                'message' => [
                    'content' => '{"region_name":"Iran","display_region_name":"Isola di Kharg"}',
                ],
            ], 200),
        ]);

        $article = Article::query()->create([
            'title' => 'Attacco a una nave vicino a Kharg',
            'slug' => 'attacco-nave-kharg',
            'summary' => 'L evento si concentra sull isola iraniana.',
            'content' => 'Fonti locali indicano come luogo dell evento l Isola di Kharg in Iran.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/kharg',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 88,
        ]);

        $service = new GeopoliticalAreaExtractionService(new RegionCoordinateResolver);
        $result = $service->extractFromArticle($article);

        $this->assertSame('Iran', $result['region_name']);
        $this->assertSame('Isola di Kharg', $result['display_region_name']);
    }

    public function test_it_discards_spurious_ai_city_names_when_they_do_not_fit_the_article_context(): void
    {
        config()->set('ai_news.ai.enabled', true);
        config()->set('ai_news.ai.base_url', 'http://127.0.0.1:11434');
        config()->set('ai_news.ai.model', 'llama3.1');

        Http::fake([
            'http://127.0.0.1:11434/api/chat' => Http::response([
                'message' => [
                    'content' => '{"region_name":"Sokodé, Centrale","display_region_name":"Sokodé, Centrale"}',
                ],
            ], 200),
        ]);

        $article = Article::query()->create([
            'title' => 'Iran: nuova fase di tensione dopo il vertice regionale',
            'slug' => 'iran-nuova-fase-tensione',
            'summary' => 'Il dossier resta centrato sull Iran.',
            'content' => 'A Teheran si valuta una nuova linea diplomatica mentre l Iran resta sotto osservazione internazionale.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/iran-context',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 86,
        ]);

        $service = new GeopoliticalAreaExtractionService(new RegionCoordinateResolver);
        $result = $service->extractFromArticle($article);

        $this->assertSame('Iran', $result['region_name']);
        $this->assertSame('Iran', $result['display_region_name']);
    }
}
