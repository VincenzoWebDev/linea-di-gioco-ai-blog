<?php

namespace Tests\Unit;

use App\Support\ThermalDecay;
use Carbon\Carbon;
use Tests\TestCase;

class ThermalDecayTest extends TestCase
{
    public function test_it_keeps_full_tension_within_the_first_24_hours(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);

        $now = Carbon::parse('2026-05-21 12:00:00');
        $updatedAt = Carbon::parse('2026-05-20 13:00:00');

        $snapshot = ThermalDecay::snapshot(78, $updatedAt, $now);

        $this->assertSame(23, $snapshot['silence_hours']);
        $this->assertSame(0, $snapshot['decay_days']);
        $this->assertSame(78, $snapshot['current_tension']);
        $this->assertSame('exponential', $snapshot['decay_model']);
    }

    public function test_it_applies_exponential_decay_after_the_latency_window(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.decay_percent_per_day', 10);

        $now = Carbon::parse('2026-05-22 11:00:00');
        $updatedAt = Carbon::parse('2026-05-20 11:00:00');

        $snapshot = ThermalDecay::snapshot(78, $updatedAt, $now);

        $this->assertSame(48, $snapshot['silence_hours']);
        $this->assertSame(1, $snapshot['decay_days']);
        $this->assertSame(70, $snapshot['current_tension']);
    }

    public function test_it_never_returns_negative_tension(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);

        $now = Carbon::parse('2026-05-21 12:00:00');
        $updatedAt = Carbon::parse('2026-05-10 12:00:00');

        $snapshot = ThermalDecay::snapshot(10, $updatedAt, $now);

        $this->assertGreaterThanOrEqual(0, $snapshot['current_tension']);
    }

    public function test_it_caps_only_the_displayed_silence_hours_after_one_week(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.decay_percent_per_day', 10);
        config()->set('ai_news.thermal_decay.max_silence_hours', 168);

        $now = Carbon::parse('2026-05-21 12:00:00');
        $updatedAt = Carbon::parse('2026-04-01 12:00:00');

        $snapshot = ThermalDecay::snapshot(95, $updatedAt, $now);

        $this->assertSame(168, $snapshot['silence_hours']);
        $this->assertGreaterThanOrEqual(0, $snapshot['current_tension']);
        $this->assertGreaterThan(6, $snapshot['decay_days']);
        $this->assertSame('Silenzio radio: 1 settimana', $snapshot['radio_silence_label']);
    }

    public function test_it_does_not_cap_silence_before_one_week(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);
        config()->set('ai_news.thermal_decay.max_silence_hours', 168);

        $now = Carbon::parse('2026-05-21 12:00:00');
        $updatedAt = Carbon::parse('2026-05-18 12:00:00');

        $snapshot = ThermalDecay::snapshot(78, $updatedAt, $now);

        $this->assertSame(72, $snapshot['silence_hours']);
        $this->assertSame(63, $snapshot['current_tension']);
        $this->assertStringNotContainsString('1 settimana', $snapshot['radio_silence_label']);
    }

    public function test_it_continues_decay_from_the_last_decay_timestamp(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.decay_percent_per_day', 10);

        $lastEventAt = Carbon::parse('2026-05-20 11:00:00');
        $lastDecayAt = Carbon::parse('2026-05-22 11:00:00');
        $now = Carbon::parse('2026-05-22 23:00:00');

        $snapshot = ThermalDecay::snapshot(70, $lastEventAt, $now, $lastDecayAt);

        $this->assertSame(60, $snapshot['silence_hours']);
        $this->assertSame(1, $snapshot['decay_days']);
        $this->assertSame(66, $snapshot['current_tension']);
    }
}
