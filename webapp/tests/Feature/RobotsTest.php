<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RobotsTest extends TestCase
{
    use RefreshDatabase;

    public function test_robots_txt_is_valid_plain_text_and_uses_absolute_sitemap_url(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertSee('User-agent: *', false);
        $response->assertSee('Allow: /', false);
        $response->assertSee('Disallow: /admin', false);
        $response->assertSee('Sitemap: '.route('sitemap'), false);
    }
}
