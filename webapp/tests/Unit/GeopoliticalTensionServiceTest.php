<?php

namespace Tests\Unit;

use App\Models\Article;
use App\Models\GeopoliticalTension;
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
            'risk_score' => 65,
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
}
