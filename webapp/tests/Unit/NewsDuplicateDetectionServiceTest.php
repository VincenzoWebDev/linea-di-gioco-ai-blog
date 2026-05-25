<?php

namespace Tests\Unit;

use App\Enums\IncomingNewsStatus;
use App\Models\Article;
use App\Models\IncomingNews;
use App\Models\NewsSource;
use App\Services\NewsDuplicateDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsDuplicateDetectionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_rejects_exact_same_title_even_from_different_source(): void
    {
        config()->set('ai_news.deduplication.merge_similar', true);

        Article::query()->create([
            'title' => 'Tensioni nel Mar Rosso tra USA e Iran',
            'slug' => 'tensioni-mar-rosso-usa-iran',
            'summary' => 'Scontri navali e minacce diplomatiche nella regione.',
            'content' => 'Le tensioni nel Mar Rosso tra Stati Uniti e Iran continuano con operazioni navali e sanzioni.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/a',
            'source_name' => 'Fonte A',
            'published_at' => now(),
        ]);

        $source = NewsSource::query()->create([
            'name' => 'Fonte B',
            'type' => 'rss',
            'endpoint' => 'https://example.com/b',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $incoming = IncomingNews::query()->create([
            'news_source_id' => $source->id,
            'fingerprint' => hash('sha256', 'incoming-b'),
            'title' => 'Tensioni nel Mar Rosso tra USA e Iran',
            'summary' => 'Scontri navali e minacce diplomatiche nella regione.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Tensioni nel Mar Rosso tra USA e Iran',
                'summary' => 'Scontri navali e minacce diplomatiche nella regione.',
                'content' => 'Le tensioni nel Mar Rosso tra Stati Uniti e Iran continuano con operazioni navali e sanzioni.',
            ],
            'published_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        $result = app(NewsDuplicateDetectionService::class)->detect(
            $incoming,
            $incoming->sanitized_payload
        );

        $this->assertTrue($result['is_duplicate']);
        $this->assertSame('reject', $result['action']);
        $this->assertSame('exact_title', $result['type']);
    }

    public function test_it_does_not_merge_similar_article_from_previous_automation_run(): void
    {
        config()->set('ai_news.deduplication.merge_similar', true);
        config()->set('ai_news.schedule_every_minutes', 60);

        Article::query()->create([
            'title' => 'Tensioni nel Mar Rosso tra USA e Iran',
            'slug' => 'tensioni-mar-rosso-usa-iran',
            'summary' => 'Scontri navali nella regione.',
            'content' => 'Le tensioni nel Mar Rosso tra Stati Uniti e Iran continuano con operazioni navali.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://example.com/a',
            'source_name' => 'Prima Fonte',
            'published_at' => now()->subHours(2),
            'created_at' => now()->subHours(2),
        ]);

        $sourceB = NewsSource::query()->create([
            'name' => 'Seconda Fonte',
            'type' => 'rss',
            'endpoint' => 'https://example.com/b',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $incoming = IncomingNews::query()->create([
            'news_source_id' => $sourceB->id,
            'fingerprint' => hash('sha256', 'incoming-b-cross'),
            'title' => 'Crisi Mar Rosso USA Iran',
            'summary' => 'Operazioni navali in corso.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Crisi Mar Rosso USA Iran',
                'summary' => 'Operazioni navali in corso.',
                'content' => 'Le tensioni nel Mar Rosso tra Stati Uniti e Iran continuano con operazioni navali.',
            ],
            'published_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        $result = app(NewsDuplicateDetectionService::class)->detect(
            $incoming,
            $incoming->sanitized_payload
        );

        $this->assertFalse($result['is_duplicate']);
        $this->assertSame('none', $result['action']);
    }

    public function test_it_rejects_similar_context_from_same_source(): void
    {
        config()->set('ai_news.deduplication.merge_similar', true);

        $source = NewsSource::query()->create([
            'name' => 'Reuters',
            'type' => 'rss',
            'endpoint' => 'https://reuters.com',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $primaryIncoming = IncomingNews::query()->create([
            'news_source_id' => $source->id,
            'fingerprint' => hash('sha256', 'primary-incoming'),
            'title' => 'Vertice NATO a Bruxelles',
            'summary' => 'Leader alleanza discutono aiuti.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Vertice NATO a Bruxelles',
                'content' => 'Il vertice NATO a Bruxelles definisce nuovi pacchetti di sostegno militare all Ucraina con focus su addestramento.',
            ],
            'published_at' => now()->subHour(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        Article::query()->create([
            'incoming_news_id' => $primaryIncoming->id,
            'title' => 'Vertice NATO a Bruxelles',
            'slug' => 'vertice-nato-bruxelles',
            'summary' => 'Leader alleanza discutono aiuti.',
            'content' => 'Il vertice NATO a Bruxelles definisce nuovi pacchetti di sostegno militare all Ucraina con focus su addestramento.',
            'status' => 'published',
            'publication_status' => 'published',
            'created_by' => 'ai',
            'source_url' => 'https://reuters.com/1',
            'source_name' => 'Reuters',
            'published_at' => now(),
        ]);

        $duplicateIncoming = IncomingNews::query()->create([
            'news_source_id' => $source->id,
            'fingerprint' => hash('sha256', 'dup-incoming'),
            'title' => 'NATO Bruxelles: nuovi aiuti Kiev',
            'summary' => 'Summit alleanza atlantica.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'NATO Bruxelles: nuovi aiuti Kiev',
                'content' => 'Il vertice NATO a Bruxelles definisce nuovi pacchetti di sostegno militare all Ucraina con focus su addestramento.',
            ],
            'published_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        $result = app(NewsDuplicateDetectionService::class)->detect(
            $duplicateIncoming,
            $duplicateIncoming->sanitized_payload
        );

        $this->assertTrue($result['is_duplicate']);
        $this->assertSame('reject', $result['action']);
        $this->assertSame('similar_context_same_source', $result['type']);
    }

    public function test_it_detects_older_pending_incoming_as_merge_target_from_different_source(): void
    {
        config()->set('ai_news.deduplication.merge_similar', true);
        config()->set('ai_news.deduplication.merge_pending_incoming', true);

        $sourceA = NewsSource::query()->create([
            'name' => 'Reuters',
            'type' => 'rss',
            'endpoint' => 'https://reuters.com',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);
        $sourceB = NewsSource::query()->create([
            'name' => 'AP',
            'type' => 'rss',
            'endpoint' => 'https://apnews.com',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $sharedContent = 'Il vertice NATO a Bruxelles definisce nuovi pacchetti di sostegno militare all Ucraina con focus su addestramento e munizioni.';

        $primary = $this->createIncomingAt(
            [
                'news_source_id' => $sourceA->id,
                'fingerprint' => hash('sha256', 'primary'),
                'title' => 'Vertice NATO a Bruxelles sul sostegno all Ucraina',
                'summary' => 'Leader alleanza discutono nuovi aiuti militari.',
                'raw_payload' => [],
                'sanitized_payload' => [
                    'title' => 'Vertice NATO a Bruxelles sul sostegno all Ucraina',
                    'summary' => 'Leader alleanza discutono nuovi aiuti militari.',
                    'content' => $sharedContent,
                ],
                'published_at' => now()->subMinutes(20),
                'status' => IncomingNewsStatus::SANITIZED,
            ],
            now()->subMinutes(20)
        );

        $secondary = IncomingNews::query()->create([
            'news_source_id' => $sourceB->id,
            'fingerprint' => hash('sha256', 'secondary'),
            'title' => 'Summit NATO: pacchetti militari per Kiev',
            'summary' => 'Leader alleanza discutono nuovi aiuti militari.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Summit NATO: pacchetti militari per Kiev',
                'summary' => 'Leader alleanza discutono nuovi aiuti militari.',
                'content' => $sharedContent,
            ],
            'published_at' => now(),
            'created_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        $result = app(NewsDuplicateDetectionService::class)->detect(
            $secondary,
            $secondary->sanitized_payload
        );

        $this->assertTrue($result['is_duplicate']);
        $this->assertSame('merge', $result['action']);
        $this->assertSame($primary->id, $result['matched_incoming_news_id']);
    }

    public function test_it_does_not_merge_pending_incoming_outside_workflow_window(): void
    {
        config()->set('ai_news.deduplication.merge_similar', true);
        config()->set('ai_news.deduplication.merge_workflow_window_minutes', 60);

        $sourceA = NewsSource::query()->create([
            'name' => 'Reuters',
            'type' => 'rss',
            'endpoint' => 'https://reuters.com',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);
        $sourceB = NewsSource::query()->create([
            'name' => 'AP',
            'type' => 'rss',
            'endpoint' => 'https://apnews.com',
            'is_active' => true,
            'poll_interval_minutes' => 60,
        ]);

        $sharedContent = 'Il vertice NATO a Bruxelles definisce nuovi pacchetti di sostegno militare all Ucraina con focus su addestramento e munizioni.';

        $this->createIncomingAt(
            [
                'news_source_id' => $sourceA->id,
                'fingerprint' => hash('sha256', 'primary-old'),
                'title' => 'Vertice NATO a Bruxelles',
                'summary' => 'Leader alleanza discutono nuovi aiuti militari.',
                'raw_payload' => [],
                'sanitized_payload' => [
                    'title' => 'Vertice NATO a Bruxelles',
                    'content' => $sharedContent,
                ],
                'published_at' => now()->subHours(3),
                'status' => IncomingNewsStatus::SANITIZED,
            ],
            now()->subHours(3)
        );

        $secondary = IncomingNews::query()->create([
            'news_source_id' => $sourceB->id,
            'fingerprint' => hash('sha256', 'secondary-new'),
            'title' => 'Summit NATO: pacchetti militari per Kiev',
            'summary' => 'Leader alleanza discutono nuovi aiuti militari.',
            'raw_payload' => [],
            'sanitized_payload' => [
                'title' => 'Summit NATO: pacchetti militari per Kiev',
                'content' => $sharedContent,
            ],
            'published_at' => now(),
            'created_at' => now(),
            'status' => IncomingNewsStatus::SANITIZED,
        ]);

        $result = app(NewsDuplicateDetectionService::class)->detect(
            $secondary,
            $secondary->sanitized_payload
        );

        $this->assertFalse($result['is_duplicate']);
        $this->assertSame('none', $result['action']);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createIncomingAt(array $attributes, \Illuminate\Support\Carbon $createdAt): IncomingNews
    {
        $incoming = IncomingNews::query()->create($attributes);
        $incoming->created_at = $createdAt;
        $incoming->updated_at = $createdAt;
        $incoming->saveQuietly();

        return $incoming->refresh();
    }
}
