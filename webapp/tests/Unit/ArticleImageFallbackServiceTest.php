<?php

namespace Tests\Unit;

use App\Services\ArticleImageFallbackService;
use Tests\TestCase;

class ArticleImageFallbackServiceTest extends TestCase
{
    public function test_it_wraps_long_titles_on_two_lines_in_svg_placeholder(): void
    {
        $service = new ArticleImageFallbackService;

        $placeholder = $service->placeholder(
            'Tensione nel Mar Nero tra alleati e avversari strategici con nuove manovre militari',
            'cover'
        );

        $this->assertSame('image/svg+xml', $placeholder['mime']);
        $this->assertStringContainsString('<tspan x="50%">', $placeholder['bytes']);
        $this->assertStringContainsString('dy="44"', $placeholder['bytes']);
    }

    public function test_it_uses_a_single_line_for_short_titles(): void
    {
        $service = new ArticleImageFallbackService;

        $placeholder = $service->placeholder('Crisi nel Baltico', 'thumb');

        $this->assertSame(1, substr_count($placeholder['bytes'], '<tspan x="50%">'));
        $this->assertStringNotContainsString('dy="30"', $placeholder['bytes']);
    }
}
