<?php

namespace Tests\Unit;

use App\Jobs\News\GenerateArticleImagesJob;
use App\Models\Article;
use App\Services\ArticleImageFallbackService;
use App\Services\ArticleImageVariantService;
use App\Services\GoogleImageService;
use App\Services\News\AiNewsWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class GenerateArticleImagesJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_builds_the_thumb_from_the_existing_cover_without_calling_ai(): void
    {
        Storage::fake('public');

        $coverPath = 'articles/1/already-generated-cover.webp';
        $coverBytes = base64_decode(
            'UklGRiIAAABXRUJQVlA4IBYAAAAQAgCdASoBAAEAAUAmJaACdLoB+AADsAD+8ut//NgVzXPv9//S4P0uD9Lg/9KQAAA=',
            true
        );

        $this->assertIsString($coverBytes);

        Storage::disk('public')->put($coverPath, $coverBytes);

        $article = Article::query()->create([
            'title' => 'Existing cover article',
            'slug' => 'existing-cover-article',
            'summary' => 'Summary',
            'content' => 'Content',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/article',
            'source_name' => 'Example',
            'ai_generated' => true,
            'quality_score' => 80,
            'image_generation_mode' => 'fallback',
            'cover_path' => $coverPath,
            'thumb_path' => null,
        ]);

        $googleImageService = Mockery::mock(GoogleImageService::class);
        $googleImageService->shouldNotReceive('generate');

        $fallbackService = Mockery::mock(ArticleImageFallbackService::class);
        $fallbackService->shouldNotReceive('placeholder');

        $job = new GenerateArticleImagesJob($article->id);
        $job->handle(
            $googleImageService,
            $fallbackService,
            app(ArticleImageVariantService::class),
            app(AiNewsWorkflowService::class)
        );

        $article->refresh();

        $this->assertSame($coverPath, $article->cover_path);
        $this->assertNotNull($article->thumb_path);
        $this->assertStringContainsString('-thumb.', $article->thumb_path);
        Storage::disk('public')->assertExists($article->thumb_path);
    }
}
