<?php

namespace Tests\Unit;

use App\Services\GeopoliticsScopeService;
use Tests\TestCase;

class GeopoliticsScopeServiceTest extends TestCase
{
    public function test_it_rejects_sports_articles_even_from_trusted_domains(): void
    {
        $service = new GeopoliticsScopeService();

        $this->assertFalse($service->isInScope(
            'Premier League: decisive match changes the title race',
            'Coaches discuss transfers, goals and the next football fixture.',
            'https://www.reuters.com/sports/soccer/premier-league-title-race-2026-05-25/'
        ));
    }

    public function test_it_accepts_geopolitics_articles_from_trusted_domains_with_supported_signals(): void
    {
        $service = new GeopoliticsScopeService();

        $this->assertTrue($service->isInScope(
            'Diplomatic tensions rise after new sanctions',
            'Government officials review security measures after the summit.',
            'https://www.reuters.com/world/europe/new-sanctions-follow-security-summit-2026-05-25/'
        ));
    }
}
