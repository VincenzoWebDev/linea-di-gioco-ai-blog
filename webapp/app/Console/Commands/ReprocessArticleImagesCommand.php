<?php

namespace App\Console\Commands;

use App\Jobs\News\GenerateArticleImagesJob;
use App\Models\Article;
use App\Services\ArticleImageVariantService;
use Illuminate\Console\Command;

class ReprocessArticleImagesCommand extends Command
{
    protected $signature = 'ai-news:images-reprocess {--article-id= : Reprocessa un solo articolo} {--limit=0 : Limita il numero di articoli} {--queue : Dispatcha i job in coda invece di eseguirli subito}';

    protected $description = 'Rigenera cover e thumb delle news in formato ottimizzato webp';

    public function handle(ArticleImageVariantService $articleImageVariantService): int
    {
        $articleId = (int) $this->option('article-id');
        $limit = max(0, (int) $this->option('limit'));
        $diagnostics = $articleImageVariantService->diagnostics();

        $this->line('Driver immagini: '.json_encode($diagnostics, JSON_UNESCAPED_SLASHES));

        if (! $articleImageVariantService->supportsWebpConversion()) {
            $this->warn('WebP non supportato da GD o Imagick in questo ambiente: i file resteranno nel formato originale.');
        }

        $query = Article::query()
            ->where('status', 'published')
            ->when($articleId > 0, fn ($builder) => $builder->where('id', $articleId))
            ->where(function ($builder) {
                $builder
                    ->whereNull('cover_path')
                    ->orWhereNull('thumb_path')
                    ->orWhere('cover_path', 'not like', '%.webp')
                    ->orWhere('thumb_path', 'not like', '%.webp');
            })
            ->orderBy('id');

        if ($limit > 0) {
            $query->limit($limit);
        }

        $articles = $query->get(['id']);

        if ($articles->isEmpty()) {
            $this->info('Nessun articolo da riconvertire.');

            return self::SUCCESS;
        }

        $queued = (bool) $this->option('queue');

        foreach ($articles as $article) {
            if ($queued) {
                GenerateArticleImagesJob::dispatch($article->id)
                    ->onQueue(config('ai_news.queues.images', 'news-images'));

                continue;
            }

            GenerateArticleImagesJob::dispatchSync($article->id);
        }

        $message = $queued
            ? "Dispatchati {$articles->count()} job di riconversione immagini."
            : "Eseguiti {$articles->count()} job di riconversione immagini in modalita sync.";

        $this->info($message);

        return self::SUCCESS;
    }
}
