<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\GeopoliticalTension;
use App\Models\Article;
use App\Services\GeopoliticalTensionService;

class GeopoliticalTensionUpsertTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_existing_tension_when_same_region_key_is_received(): void
    {
        $article1 = Article::create([
            'title' => 'Tensione in Ucraina',
            'summary' => 'Prima news',
            'content' => 'contenuto',
            'slug' => 'test-1',
            'status' => 'published',
        ]);

        $article2 = Article::create([
            'title' => 'Aggiornamento Ucraina',
            'summary' => 'Seconda news',
            'content' => 'contenuto aggiornato',
            'slug' => 'test-2',
            'status' => 'published',
        ]);

        $service = app(GeopoliticalTensionService::class);

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Ukraine',
                'display_region_name' => 'Ukraine',
                'risk_score' => 50,
                'trend_direction' => 'rising',
                'status_label' => 'war',
            ]
        ], $article1);

        $this->assertCount(1, GeopoliticalTension::all());

        $first = GeopoliticalTension::first();

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Ukraine',
                'display_region_name' => 'Ukraine',
                'risk_score' => 80,
                'trend_direction' => 'rising',
                'status_label' => 'escalation',
            ]
        ], $article2);

        $this->assertCount(1, GeopoliticalTension::all());

        $updated = GeopoliticalTension::first();

        // ✔️ stessa riga aggiornata
        $this->assertEquals($first->id, $updated->id);

        // ✔️ cambiamento articolo OK
        $this->assertEquals($article2->id, $updated->featured_article_id);

        // ✔️ status aggiornato
        $this->assertEquals('escalation', $updated->status_label);
    }
}
