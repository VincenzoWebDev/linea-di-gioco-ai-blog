<?php

namespace Tests\Unit;

use App\Models\GeopoliticalTension;
use App\Services\GeopoliticalTensionService;
use App\Services\RegionCoordinateResolver;
use App\Services\RiskScoreCalibrationService;
use Carbon\Carbon;
use Tests\TestCase;

class GeopoliticalTensionServiceTest extends TestCase
{
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
}
