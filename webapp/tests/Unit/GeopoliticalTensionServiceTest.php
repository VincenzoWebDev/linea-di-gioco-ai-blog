<?php

namespace Tests\Unit;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\GeopoliticalEventWeightService;
use App\Services\GeopoliticalTensionService;
use App\Services\RegionCoordinateResolver;
use App\Services\RiskScoreCalibrationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeopoliticalTensionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_marks_trend_as_falling_when_decay_reduces_current_tension(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);

        Carbon::setTestNow(Carbon::parse('2026-05-22 12:00:00'));

        $tension = new GeopoliticalTension([
            'risk_score' => 78,
            'trend_direction' => 'rising',
        ]);
        $tension->updated_at = Carbon::parse('2026-05-20 11:00:00');

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $this->assertSame('falling', $service->resolveTrendDirection($tension));

        Carbon::setTestNow();
    }

    public function test_it_preserves_stable_trend_when_score_has_not_changed(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);

        Carbon::setTestNow(Carbon::parse('2026-05-22 12:00:00'));

        $tension = new GeopoliticalTension([
            'risk_score' => 52,
            'trend_direction' => 'stable',
        ]);
        $tension->updated_at = Carbon::parse('2026-05-22 10:00:00');

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $this->assertSame('stable', $service->resolveTrendDirection($tension));

        Carbon::setTestNow();
    }

    public function test_it_updates_existing_tension_using_same_coordinates_and_canonical_italian_region_name(): void
    {
        $article = Article::query()->create([
            'title' => 'Aggiornamento su Ucraina',
            'slug' => 'aggiornamento-su-ucraina',
            'summary' => 'Sintesi',
            'content' => 'Dettagli della notizia',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 75,
        ]);

        GeopoliticalTension::query()->create([
            'region_name' => 'Ukraine',
            'latitude' => 50.4501,
            'longitude' => 30.5234,
            'risk_score' => 40,
            'trend_direction' => 'stable',
            'status_label' => 'Tensione geopolitica',
            'featured_article_id' => $article->id,
        ]);

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Ucraina',
                'risk_score' => 65,
                'trend_direction' => 'rising',
                'status_label' => 'Escalation militare',
            ],
        ], $article);

        $this->assertDatabaseCount('geopolitical_tensions', 1);
        $this->assertDatabaseHas('geopolitical_tensions', [
            'region_name' => 'Ucraina',
            'risk_score' => 70,
            'trend_direction' => 'rising',
            'status_label' => 'Escalation militare',
            'featured_article_id' => $article->id,
        ]);
    }

    public function test_it_applies_agent_trend_for_a_new_tension_record(): void
    {
        $article = Article::query()->create([
            'title' => 'Aggiornamento su Cina',
            'slug' => 'aggiornamento-su-cina',
            'summary' => 'Sintesi',
            'content' => 'Dettagli della notizia',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 80,
        ]);

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Cina',
                'risk_score' => 70,
                'trend_direction' => 'rising',
                'status_label' => 'Escalation diplomatica',
            ],
        ], $article);

        $this->assertDatabaseHas('geopolitical_tensions', [
            'region_name' => 'Cina',
            'trend_direction' => 'rising',
            'status_label' => 'Escalation diplomatica',
        ]);
    }

    public function test_it_raises_implausibly_low_risk_scores_when_article_contains_clear_escalation_signals(): void
    {
        $article = Article::query()->create([
            'title' => 'Missili e raid al confine tra Israele e Iran',
            'slug' => 'missili-e-raid-al-confine',
            'summary' => 'Nuove minacce e raid alimentano la crisi regionale.',
            'content' => 'Fonti ufficiali parlano di missili, raid, truppe mobilitate e rischio di escalation militare.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/escalation',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 88,
        ]);

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Medio Oriente',
                'risk_score' => 1,
                'trend_direction' => 'rising',
                'status_label' => 'Escalation militare',
            ],
        ], $article);

        $this->assertDatabaseHas('geopolitical_tensions', [
            'region_name' => 'Medio Oriente',
            'risk_score' => 30,
            'trend_direction' => 'rising',
            'status_label' => 'Escalation militare',
        ]);
    }

    public function test_it_keeps_low_scores_for_routine_diplomatic_updates_without_escalation_signals(): void
    {
        $article = Article::query()->create([
            'title' => 'Vertice bilaterale sulla sicurezza energetica europea',
            'slug' => 'vertice-bilaterale-sicurezza-energetica',
            'summary' => 'I leader rilanciano il dialogo in un comunicato congiunto.',
            'content' => 'Il summit si chiude con un comunicato stampa e nuovi colloqui tecnici senza segnali di crisi immediata.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/routine',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 74,
        ]);

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Europa',
                'risk_score' => 1,
                'trend_direction' => 'stable',
                'status_label' => 'Monitoraggio diplomatico',
            ],
        ], $article);

        $this->assertDatabaseHas('geopolitical_tensions', [
            'region_name' => 'Unione Europea',
            'risk_score' => 5,
            'trend_direction' => 'rising',
            'status_label' => 'Monitoraggio diplomatico',
        ]);
    }

    public function test_it_does_not_keep_a_decayed_area_at_zero_when_clear_attack_signals_arrive_with_falling_agent_trend(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-29 09:00:00'));

        GeopoliticalTension::query()->create([
            'region_name' => 'Iran',
            'risk_score' => 0,
            'trend_direction' => 'falling',
            'status_label' => 'Silenzio operativo',
            'last_event_at' => Carbon::parse('2026-05-20 09:00:00'),
            'last_decay_at' => Carbon::parse('2026-05-28 15:00:00'),
        ]);

        $article = Article::query()->create([
            'title' => 'Iran attacca una base USA in Iraq',
            'slug' => 'iran-attacca-base-usa-iraq',
            'summary' => 'Missili e droni colpiscono una base statunitense nella regione.',
            'content' => 'Fonti di sicurezza parlano di un attacco contro forze statunitensi e di possibile ritorsione militare.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/iran-base-usa',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 90,
        ]);

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Iran',
                'risk_score' => 1,
                'trend_direction' => 'falling',
                'status_label' => 'Attacco contro forze statunitensi',
            ],
        ], $article);

        $this->assertDatabaseHas('geopolitical_tensions', [
            'region_name' => 'Iran',
            'risk_score' => 40,
            'trend_direction' => 'rising',
            'status_label' => 'Attacco contro forze statunitensi',
            'featured_article_id' => $article->id,
        ]);

        Carbon::setTestNow();
    }

    public function test_it_assigns_more_elastic_scores_to_low_agent_outputs_with_different_medium_signal_strength(): void
    {
        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $lighterArticle = Article::query()->create([
            'title' => 'Nuove sanzioni e minacce al confine orientale',
            'slug' => 'nuove-sanzioni-e-minacce-al-confine-orientale',
            'summary' => 'Pressioni diplomatiche in aumento.',
            'content' => 'Le parti parlano di sanzioni, minacce e tensioni al confine senza conferma di attacchi.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/lighter',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 71,
        ]);

        $strongerArticle = Article::query()->create([
            'title' => 'Sanzioni, truppe, raid e ultimatum nella crisi regionale',
            'slug' => 'sanzioni-truppe-raid-e-ultimatum',
            'summary' => 'La pressione strategica cresce su piu fronti.',
            'content' => 'La crisi registra sanzioni, truppe, raid, ultimatum, deterrenza e nuove minacce lungo il fronte.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/stronger',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 79,
        ]);

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Europa orientale',
                'risk_score' => 1,
                'trend_direction' => 'stable',
                'status_label' => 'Pressione diplomatica',
            ],
        ], $lighterArticle);

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Mar Nero',
                'risk_score' => 1,
                'trend_direction' => 'rising',
                'status_label' => 'Escalation strategica',
            ],
        ], $strongerArticle);

        $lighterScore = (int) GeopoliticalTension::query()
            ->where('featured_article_id', $lighterArticle->id)
            ->value('risk_score');

        $strongerScore = (int) GeopoliticalTension::query()
            ->where('featured_article_id', $strongerArticle->id)
            ->value('risk_score');

        $this->assertGreaterThanOrEqual(10, $lighterScore);
        $this->assertGreaterThan($lighterScore, $strongerScore);
        $this->assertNotSame(42, $lighterScore);
        $this->assertNotSame(42, $strongerScore);
    }

    public function test_it_accumulates_pressure_and_allows_decompression_on_the_same_area(): void
    {
        $olderArticle = Article::query()->create([
            'title' => 'Prima crisi nel Mar Rosso',
            'slug' => 'prima-crisi-mar-rosso',
            'summary' => 'Sintesi',
            'content' => 'Raid e minacce lungo le rotte marittime.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/older',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 76,
        ]);

        $newerArticle = Article::query()->create([
            'title' => 'Nuovo dossier sul Mar Rosso',
            'slug' => 'nuovo-dossier-mar-rosso',
            'summary' => 'Sintesi',
            'content' => 'Missili, truppe e nuove minacce sulle rotte commerciali.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/newer',
            'source_name' => 'test',
            'ai_generated' => true,
            'quality_score' => 83,
        ]);

        $service = new GeopoliticalTensionService(
            new RegionCoordinateResolver(),
            new RiskScoreCalibrationService(),
            new GeopoliticalEventWeightService(),
        );

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Mar Rosso',
                'risk_score' => 58,
                'trend_direction' => 'stable',
                'status_label' => 'Pressione regionale',
            ],
        ], $olderArticle);

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Red Sea',
                'risk_score' => 72,
                'trend_direction' => 'rising',
                'status_label' => 'Escalation marittima',
            ],
        ], $newerArticle);

        $service->upsertFromAgentOutput([
            'geopolitical_tension' => [
                'region_name' => 'Mar Rosso',
                'risk_score' => 49,
                'trend_direction' => 'falling',
                'status_label' => 'Cessate il fuoco e ritiro delle truppe',
            ],
        ], $olderArticle);

        $this->assertDatabaseCount('geopolitical_tensions', 1);
        $this->assertDatabaseHas('geopolitical_tensions', [
            'region_name' => 'Mar Rosso',
            'risk_score' => 40,
            'trend_direction' => 'falling',
            'status_label' => 'Cessate il fuoco e ritiro delle truppe',
            'featured_article_id' => $olderArticle->id,
        ]);
    }
}
