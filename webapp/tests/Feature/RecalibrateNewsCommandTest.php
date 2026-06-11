<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecalibrateNewsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_recalibrates_news_and_tensions_correctly(): void
    {
        $article = Article::create([
            'title' => 'Guerra ed escalation totale',
            'summary' => 'Sintesi di una guerra grave',
            'content' => 'Guerra ed invasione con bombardamenti e mobilitazione militare nel teatro.',
            'slug' => 'test-recalibrate',
            'status' => 'published',
            'quality_score' => 10.00, // artificialmente basso per il test
        ]);

        $tension = GeopoliticalTension::create([
            'region_name' => 'Ucraina',
            'display_region_name' => 'Ucraina',
            'region_key' => 'ucraina',
            'risk_score' => 5, // artificialmente basso per il test
            'trend_direction' => 'rising',
            'status_label' => 'Guerra aperta',
            'featured_article_id' => $article->id,
            'last_event_at' => now(),
        ]);

        // 1. Esecuzione del comando in modalità Dry-Run (non deve modificare nulla nel DB)
        $this->artisan('ai-news:recalibrate', ['--dry-run' => true])
            ->assertSuccessful();

        $this->assertEquals(10.00, (float) $article->fresh()->quality_score);
        $this->assertEquals(5, (int) $tension->fresh()->risk_score);

        // 2. Esecuzione del comando reale (deve aggiornare i punteggi nel DB)
        $this->artisan('ai-news:recalibrate')
            ->assertSuccessful();

        // Il quality_score deve essere ricalcolato e aumentato significativamente (> 10)
        $this->assertGreaterThan(10.00, (float) $article->fresh()->quality_score);

        // Il risk_score della tensione deve salire a causa delle parole chiave forti ("guerra", "invasione") nell'articolo
        $this->assertGreaterThan(5, (int) $tension->fresh()->risk_score);
    }
}
