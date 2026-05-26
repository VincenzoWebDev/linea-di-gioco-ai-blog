<?php

namespace Tests\Unit;

use App\Jobs\News\FetchNewsJob;
use App\Models\NewsSource;
use App\Services\Agents\NewsScoutAgent;
use App\Services\News\AiNewsWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class FetchNewsJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_rejects_non_forced_runs_outside_the_allowed_trigger_windows(): void
    {
        Bus::fake();

        NewsSource::query()->create([
            'name' => 'Reuters',
            'type' => 'rss',
            'endpoint' => 'https://example.com/rss',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $agent = \Mockery::mock(NewsScoutAgent::class);
        $agent->shouldNotReceive('discover');

        (new FetchNewsJob(false, '2026-05-26 08:00:00'))->handle(
            $agent,
            app(AiNewsWorkflowService::class)
        );

        Bus::assertNothingDispatched();
    }
}
