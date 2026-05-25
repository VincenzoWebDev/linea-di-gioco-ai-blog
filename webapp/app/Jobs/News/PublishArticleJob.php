<?php

namespace App\Jobs\News;

use App\Enums\ArticlePublicationStatus;
use App\Models\Article;
use App\Models\PublicationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PublishArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public int $articleId)
    {
    }

    public function handle(): void
    {
        $article = Article::query()->find($this->articleId);
        if (! $article) {
            return;
        }

        if (($article->publication_status !== ArticlePublicationStatus::PUBLISHED || $article->status !== 'published')
            && $this->shouldDelayPublication()) {
            PublishArticleJob::dispatch($article->id)
                ->delay($this->nextPublishAttempt())
                ->onQueue(config('ai_news.queues.publish', 'news-publish'));

            return;
        }

        if ($article->publication_status !== ArticlePublicationStatus::PUBLISHED || $article->status !== 'published') {
            $article->update([
                'publication_status' => ArticlePublicationStatus::PUBLISHED,
                'status' => 'published',
                'published_at' => $article->published_at ?? now(),
            ]);
        }

        PublicationLog::query()->create([
            'article_id' => $article->id,
            'event' => 'published',
            'meta' => [
                'published_at' => optional($article->published_at)->toIso8601String(),
            ],
        ]);
    }

    private function shouldDelayPublication(): bool
    {
        $maxPerDay = (int) config('ai_news.max_articles_per_day', 10);

        if ($maxPerDay <= 0) {
            return false;
        }

        return Article::query()
            ->where('status', 'published')
            ->whereDate('published_at', now()->toDateString())
            ->count() >= $maxPerDay;
    }

    private function nextPublishAttempt(): \DateTimeInterface
    {
        return now()->tomorrow()->addSeconds(5);
    }
}

