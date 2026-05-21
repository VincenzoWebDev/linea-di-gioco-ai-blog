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
    }

    public function test_it_applies_decay_after_the_first_day_of_silence(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);

        $now = Carbon::parse('2026-05-21 12:00:00');
        $updatedAt = Carbon::parse('2026-05-20 11:00:00');

        $snapshot = ThermalDecay::snapshot(78, $updatedAt, $now);

        $this->assertSame(25, $snapshot['silence_hours']);
        $this->assertSame(1, $snapshot['decay_days']);
        $this->assertSame(63, $snapshot['current_tension']);
    }

    public function test_it_never_returns_negative_tension(): void
    {
        config()->set('ai_news.thermal_decay.grace_hours', 24);
        config()->set('ai_news.thermal_decay.penalty_per_day', 15);

        $now = Carbon::parse('2026-05-21 12:00:00');
        $updatedAt = Carbon::parse('2026-05-10 12:00:00');

        $snapshot = ThermalDecay::snapshot(10, $updatedAt, $now);

        $this->assertSame(0, $snapshot['current_tension']);
    }
}
