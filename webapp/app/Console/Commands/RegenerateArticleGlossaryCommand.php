<?php

namespace App\Console\Commands;

use App\Jobs\News\GenerateArticleGlossaryJob;
use App\Models\Article;
use Illuminate\Console\Command;

class RegenerateArticleGlossaryCommand extends Command
{
    protected $signature = 'articles:regenerate-glossary {--sync : Genera in sincrono senza coda}';

    protected $description = 'Rigenera il glossario AI per articoli senza glossary o per tutti con --force';

    public function handle(): int
    {
        $query = Article::query()->whereNull('glossary');

        $count = $query->count();
        if ($count === 0) {
            $this->info('Nessun articolo senza glossario.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $query->orderBy('id')->chunkById(20, function ($articles) use ($bar): void {
            foreach ($articles as $article) {
                if ($this->option('sync')) {
                    GenerateArticleGlossaryJob::dispatchSync($article->id);
                } else {
                    GenerateArticleGlossaryJob::dispatch($article->id)
                        ->onQueue(config('ai_news.queues.glossary', 'news-sanitize'));
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info("Accodati {$count} articoli per rigenerazione glossario.");

        return self::SUCCESS;
    }
}
