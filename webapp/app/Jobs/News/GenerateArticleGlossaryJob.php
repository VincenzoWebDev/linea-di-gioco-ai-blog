<?php

namespace App\Jobs\News;

use App\Models\Article;
use App\Services\ArticleGlossaryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateArticleGlossaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public int $articleId)
    {
    }

    public function handle(ArticleGlossaryService $glossaryService): void
    {
        $article = Article::query()->find($this->articleId);
        if (! $article || ! empty($article->glossary)) {
            return;
        }

        $glossary = $glossaryService->build(
            (string) $article->title,
            (string) $article->content
        );

        if ($glossary === []) {
            return;
        }

        $article->update(['glossary' => $glossary]);
    }
}
