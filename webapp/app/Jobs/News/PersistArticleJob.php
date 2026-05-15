<?php

namespace App\Jobs\News;

use App\Enums\ArticlePublicationStatus;
use App\Enums\IncomingNewsStatus;
use App\Models\Article;
use App\Models\IncomingNews;
use App\Models\PublicationLog;
use App\Services\CategoryAssignmentService;
use App\Services\GeopoliticalTensionService;
use App\Services\News\IncomingNewsStateMachine;
use App\Support\ArticleContentNormalizer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class PersistArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public int $incomingNewsId)
    {
    }

    public function handle(
        CategoryAssignmentService $categoryAssignmentService,
        GeopoliticalTensionService $geopoliticalTensionService,
        IncomingNewsStateMachine $stateMachine
    ): void
    {
        $incoming = IncomingNews::query()
            ->with('source')
            ->find($this->incomingNewsId);
        if (! $incoming || $incoming->article()->exists()) {
            return;
        }

        $payload = $incoming->sanitized_payload ?? [];
        $baseSlug = Str::slug((string) ($payload['title'] ?? 'news-'.$incoming->id));
        $slug = $this->uniqueSlug($baseSlug ?: 'news-'.$incoming->id, $incoming->id);

        $autoPublish = (bool) config('ai_news.auto_publish', false);
        $publicationStatus = $autoPublish
            ? ArticlePublicationStatus::PUBLISHED
            : ArticlePublicationStatus::PENDING_REVIEW;
        $suggestedCategories = collect((array) ($payload['categories'] ?? []))
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->values()
            ->all();
        if ($suggestedCategories === [] && isset($payload['topic'])) {
            $topic = trim((string) $payload['topic']);
            if ($topic !== '') {
                $suggestedCategories = [$topic];
            }
        }

        $categoryIds = $categoryAssignmentService->resolveCategoryIds(
            (string) ($payload['title'] ?? $incoming->title),
            (string) ($payload['summary'] ?? $incoming->summary),
            (string) ($payload['content'] ?? ''),
            $suggestedCategories
        );

        $content = ArticleContentNormalizer::stripSourceFooter((string) ($payload['content'] ?? ''));

        $article = Article::query()->create([
            'incoming_news_id' => $incoming->id,
            'title' => (string) ($payload['title'] ?? $incoming->title),
            'slug' => $slug,
            'summary' => (string) ($payload['summary'] ?? $incoming->summary),
            'content' => $content,
            'status' => $autoPublish ? 'published' : 'review',
            'publication_status' => $publicationStatus,
            'created_by' => 'ai',
            'source_url' => ArticleContentNormalizer::preferNonEmptyString($payload['source_url'] ?? null, $incoming->url),
            'source_name' => (string) ($incoming->source?->name ?? 'unknown'),
            'ai_generated' => true,
            'quality_score' => (float) ($payload['quality_score'] ?? 0),
            'published_at' => $autoPublish ? ($incoming->published_at ?? now()) : null,
        ]);

        PublicationLog::query()->create([
            'article_id' => $article->id,
            'event' => 'created',
            'meta' => [
                'incoming_news_id' => $incoming->id,
                'auto_publish' => $autoPublish,
                'category_ids' => $categoryIds,
            ],
        ]);

        if ($categoryIds !== []) {
            $article->categories()->sync($categoryIds);
        }

        $geopoliticalTensionService->upsertFromAgentOutput($payload, $article);

        if ($autoPublish) {
            PublishArticleJob::dispatch($article->id)
                ->onQueue(config('ai_news.queues.publish', 'news-publish'));
        }

        GenerateArticleImagesJob::dispatch($article->id)
            ->onQueue(config('ai_news.queues.images', 'news-images'));

        if ($autoPublish) {
            $stateMachine->transition($incoming, IncomingNewsStatus::PUBLISHED);
        }
    }

    private function uniqueSlug(string $baseSlug, int $incomingId): string
    {
        $slug = $baseSlug;
        $attempt = 1;

        while (Article::query()->where('slug', $slug)->exists()) {
            $attempt++;
            $slug = $baseSlug.'-'.$incomingId.'-'.$attempt;
        }

        return $slug;
    }

}
