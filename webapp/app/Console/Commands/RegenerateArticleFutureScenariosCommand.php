<?php

namespace App\Console\Commands;

use App\Jobs\News\GenerateArticleFutureScenariosJob;
use App\Models\Article;
use Illuminate\Console\Command;

class RegenerateArticleFutureScenariosCommand extends Command
{
    protected $signature = 'articles:regenerate-future-scenarios {--queue : Accoda il lavoro invece di eseguirlo subito}';

    protected $description = 'Rigenera gli scenari futuri per articoli che non li hanno ancora';

    public function handle(): int
    {
        $query = Article::query()->whereNull('future_scenarios');

        $count = $query->count();
        if ($count === 0) {
            $this->info('Nessun articolo senza scenari futuri.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $query->orderBy('id')->chunkById(20, function ($articles) use ($bar): void {
            foreach ($articles as $article) {
                if ($this->option('queue')) {
                    GenerateArticleFutureScenariosJob::dispatch($article->id)
                        ->onQueue(config('ai_news.queues.glossary', 'news-sanitize'));
                } else {
                    GenerateArticleFutureScenariosJob::dispatchSync($article->id);
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $message = $this->option('queue')
            ? "Accodati {$count} articoli per rigenerazione scenari futuri."
            : "Rigenerati {$count} articoli con scenari futuri.";

        $this->info($message);

        return self::SUCCESS;
    }
}
