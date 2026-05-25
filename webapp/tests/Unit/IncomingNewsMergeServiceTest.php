<?php

namespace Tests\Unit;

use App\Enums\IncomingNewsStatus;
use App\Jobs\News\ValidateSanitizedArticleJob;
use App\Models\Article;
use App\Models\IncomingNews;
use App\Models\NewsSource;
use App\Services\News\IncomingNewsMergeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class IncomingNewsMergeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_marks_incoming_as_published_when_merged_into_existing_article(): void
    {
        $article = Article::query()->create([
            'title' => 'Articolo esistente',
            'slug' => 'articolo-esistente',
            'summary' => 'Summary',
            'content' => 'Content',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/original',
            'source_name' => 'Fonte Originale',
            'published_at' => now(),
        ]);

        $source = NewsSource::query()->create([
            'name' => 'Altra Fonte',
            'type' => 'rss',
            'endpoint' => 'https://example.com/alt',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $incoming = IncomingNews::query()->create([
            'news_source_id' => $source->id,
            'fingerprint' => hash('sha256', 'merge-into-article'),
            'title' => 'Duplicato',
            'summary' => 'Summary',
            'raw_payload' => [],
            'sanitized_payload' => ['title' => 'Duplicato', 'content' => 'Content'],
            'published_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        app(IncomingNewsMergeService::class)->mergeIntoArticle($incoming, $article->id, [
            'type' => 'similar_context',
            'score' => 0.9,
            'reason' => 'duplicate_similar_context',
        ]);

        $incoming->refresh();
        $article->refresh();

        $this->assertSame(IncomingNewsStatus::PUBLISHED, $incoming->status);
        $this->assertSame($article->id, $incoming->merged_into_article_id);
        $this->assertSame('Fonte Originale', $article->source_name);
        $this->assertDatabaseHas('publication_logs', [
            'article_id' => $article->id,
            'event' => 'merged_duplicate_incoming',
        ]);
    }

    public function test_validate_job_merges_cross_source_pending_in_same_workflow(): void
    {
        Bus::fake();

        config()->set('ai_news.deduplication.merge_similar', true);
        config()->set('ai_news.schedule_every_minutes', 60);

        $sourceA = NewsSource::query()->create([
            'name' => 'Prima Fonte',
            'type' => 'rss',
            'endpoint' => 'https://example.com/a',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);
        $sourceB = NewsSource::query()->create([
            'name' => 'Seconda Fonte',
            'type' => 'rss',
            'endpoint' => 'https://example.com/b',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $sharedContent = 'Le tensioni nel Mar Rosso tra Stati Uniti e Iran continuano con operazioni navali.';

        $primary = IncomingNews::query()->create([
            'news_source_id' => $sourceA->id,
            'fingerprint' => hash('sha256', 'workflow-primary'),
            'title' => 'Tensioni nel Mar Rosso tra USA e Iran',
            'summary' => 'Scontri navali nella regione.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Tensioni nel Mar Rosso tra USA e Iran',
                'summary' => 'Scontri navali nella regione.',
                'content' => $sharedContent,
                'quality_score' => 85,
            ],
            'published_at' => now()->subMinutes(10),
            'status' => IncomingNewsStatus::VALIDATED,
        ]);
        $primary->created_at = now()->subMinutes(10);
        $primary->updated_at = now()->subMinutes(10);
        $primary->saveQuietly();

        $secondary = IncomingNews::query()->create([
            'news_source_id' => $sourceB->id,
            'fingerprint' => hash('sha256', 'workflow-secondary'),
            'title' => 'Crisi Mar Rosso USA Iran',
            'summary' => 'Operazioni navali in corso.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Crisi Mar Rosso USA Iran',
                'summary' => 'Operazioni navali in corso.',
                'content' => $sharedContent,
                'quality_score' => 85,
            ],
            'published_at' => now(),
            'created_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        (new ValidateSanitizedArticleJob($secondary->id))->handle(
            app(\App\Services\ArticleValidationService::class),
            app(\App\Services\NewsDuplicateDetectionService::class),
            app(IncomingNewsMergeService::class),
            app(\App\Services\News\IncomingNewsStateMachine::class),
            app(\App\Services\News\NewsPipelineOrchestrator::class)
        );

        $secondary->refresh();

        $this->assertSame(IncomingNewsStatus::PUBLISHED, $secondary->status);
        $this->assertNotNull($secondary->merged_into_incoming_news_id);
        Bus::assertNotDispatched(\App\Jobs\News\PersistArticleJob::class);
    }
}
