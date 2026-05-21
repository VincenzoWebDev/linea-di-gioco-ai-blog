<?php

namespace App\Jobs\News;

use App\Models\Article;
use App\Services\ArticleInsightService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateArticleFutureScenariosJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public int $articleId)
    {
    }

    public function handle(ArticleInsightService $articleInsightService): void
    {
        $article = Article::query()
            ->with('categories:id,name')
            ->find($this->articleId);

        if (! $article || ! empty($article->future_scenarios)) {
            return;
        }

        $scenarios = $articleInsightService->buildArticleFutureScenarios([
            'title' => $article->title,
            'summary' => $article->summary,
            'content' => $article->content,
            'topic' => $article->categories->pluck('name')->first(),
            'future_scenarios' => $article->future_scenarios,
        ]);

        if ($scenarios === []) {
            return;
        }

        $article->update(['future_scenarios' => $scenarios]);
    }
}
