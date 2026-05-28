<?php

namespace Tests\Unit;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\News\AiNewsWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiNewsWorkflowServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_accepts_only_the_configured_trigger_hours_on_the_hour(): void
    {
        $service = app(AiNewsWorkflowService::class);

        $this->assertTrue($service->isAllowedTriggerTime('2026-05-26 05:00:00'));
        $this->assertTrue($service->isAllowedTriggerTime('2026-05-26 09:00:00'));
        $this->assertTrue($service->isAllowedTriggerTime('2026-05-26 13:00:00'));
        $this->assertTrue($service->isAllowedTriggerTime('2026-05-26 17:00:00'));
        $this->assertTrue($service->isAllowedTriggerTime('2026-05-26 21:00:00'));
        $this->assertFalse($service->isAllowedTriggerTime('2026-05-26 08:00:00'));
        $this->assertFalse($service->isAllowedTriggerTime('2026-05-26 05:15:00'));
    }

    public function test_it_calculates_session_quota_from_the_remaining_daily_ai_budget(): void
    {
        config()->set('ai_news.workflow.daily_ai_image_budget', 10);
        config()->set('ai_news.workflow.max_ai_images_per_session', 2);

        for ($i = 1; $i <= 8; $i++) {
            Article::query()->create([
                'title' => 'Published '.$i,
                'slug' => 'published-'.$i,
                'summary' => 'Summary',
                'content' => 'Content',
                'status' => 'published',
                'publication_status' => 'published',
                'created_by' => 'ai',
                'source_url' => 'https://example.com/'.$i,
                'source_name' => 'Test',
                'ai_generated' => true,
                'quality_score' => 80,
                'ai_image_generated_at' => '2026-05-26 03:00:00',
            ]);
        }

        $metadata = app(AiNewsWorkflowService::class)->sessionMetadata('2026-05-26 13:00:00');

        $this->assertSame('2026052613', $metadata['session_key']);
        $this->assertSame(2, $metadata['session_ai_quota']);
    }

    public function test_it_assigns_ai_only_to_the_highest_ranked_articles_in_the_session(): void
    {
        $service = app(AiNewsWorkflowService::class);
        $sessionKey = '2026052613';

        $articles = collect([
            ['slug' => 'alpha', 'risk' => 91],
            ['slug' => 'bravo', 'risk' => 77],
            ['slug' => 'charlie', 'risk' => 62],
            ['slug' => 'delta', 'risk' => 40],
        ])->map(function (array $item, int $index) use ($sessionKey) {
            $article = Article::query()->create([
                'title' => strtoupper($item['slug']),
                'slug' => $item['slug'],
                'summary' => 'Summary',
                'content' => 'Content',
                'status' => 'published',
                'publication_status' => 'published',
                'created_by' => 'ai',
                'source_url' => 'https://example.com/'.$item['slug'],
                'source_name' => 'Test',
                'ai_generated' => true,
                'quality_score' => 80 - $index,
                'workflow_session_key' => $sessionKey,
                'workflow_triggered_at' => '2026-05-26 13:00:00',
                'workflow_trigger_hour' => 13,
                'workflow_session_ai_quota' => 2,
                'image_generation_mode' => 'fallback',
            ]);

            GeopoliticalTension::query()->create([
                'region_name' => 'Region '.$index,
                'risk_score' => $item['risk'],
                'trend_direction' => 'rising',
                'status_label' => 'Escalation',
                'featured_article_id' => $article->id,
            ]);

            return $article;
        });

        $service->synchronizeSessionAssignments($articles->first());

        $this->assertDatabaseHas('articles', [
            'slug' => 'alpha',
            'workflow_session_rank' => 1,
            'image_generation_mode' => 'ai',
        ]);
        $this->assertDatabaseHas('articles', [
            'slug' => 'bravo',
            'workflow_session_rank' => 2,
            'image_generation_mode' => 'ai',
        ]);
        $this->assertDatabaseHas('articles', [
            'slug' => 'charlie',
            'workflow_session_rank' => 3,
            'image_generation_mode' => 'fallback',
        ]);
        $this->assertDatabaseHas('articles', [
            'slug' => 'delta',
            'workflow_session_rank' => 4,
            'image_generation_mode' => 'fallback',
        ]);
    }
}
