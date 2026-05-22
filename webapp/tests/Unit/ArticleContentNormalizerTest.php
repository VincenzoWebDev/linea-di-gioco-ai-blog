<?php

namespace Tests\Unit;

use App\Support\ArticleContentNormalizer;
use Tests\TestCase;

class ArticleContentNormalizerTest extends TestCase
{
    public function test_it_rejects_placeholder_urls_as_usable_sources(): void
    {
        $this->assertFalse(ArticleContentNormalizer::isUsableUrl('https://example.com/world'));
        $this->assertFalse(ArticleContentNormalizer::isUsableUrl('https://dispatch.local/article'));
        $this->assertTrue(ArticleContentNormalizer::isUsableUrl('https://www.reuters.com/world/test'));
    }

    public function test_it_prefers_the_first_usable_source_url(): void
    {
        $resolved = ArticleContentNormalizer::preferUsableUrl(
            'https://example.com/world',
            'https://news.example.com/story',
            'https://www.reuters.com/world/test'
        );

        $this->assertSame('https://www.reuters.com/world/test', $resolved);
    }
}
