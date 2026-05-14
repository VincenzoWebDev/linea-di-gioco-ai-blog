<?php

namespace App\Console\Commands;

use App\Models\NewsSource;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AiNewsDiagnoseCommand extends Command
{
    protected $signature = 'ai-news:diagnose';

    protected $description = 'Diagnostica rapida della pipeline AI news e delle code configurate';

    public function handle(): int
    {
        $this->info('AI news diagnose');
        $this->line('Queue connection: '.config('queue.default'));
        $this->line('Schedule every minutes: '.config('ai_news.schedule_every_minutes'));
        $this->line('Queues:');
        $this->line('  ingest: '.config('ai_news.queues.ingest', 'news-ingest'));
        $this->line('  extract: '.config('ai_news.queues.extract', 'news-extract'));
        $this->line('  sanitize: '.config('ai_news.queues.sanitize', 'news-sanitize'));
        $this->line('  publish: '.config('ai_news.queues.publish', 'news-publish'));
        $this->line('  images: '.config('ai_news.queues.images', 'news-images'));

        $sources = NewsSource::query()
            ->orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'endpoint', 'is_active', 'poll_interval_minutes']);

        $this->line('');
        $this->info('Sources');
        if ($sources->isEmpty()) {
            $this->warn('Nessuna source presente.');
        } else {
            foreach ($sources as $source) {
                $state = $source->is_active ? 'active' : 'inactive';
                $this->line(sprintf(
                    '[%s] #%d %s | %s | every %d min',
                    $state,
                    $source->id,
                    $source->name,
                    $source->type,
                    (int) $source->poll_interval_minutes
                ));
            }
        }

        if (config('queue.default') === 'database' && DB::getSchemaBuilder()->hasTable('jobs')) {
            $this->line('');
            $this->info('Pending jobs by queue');

            $rows = DB::table('jobs')
                ->select('queue', DB::raw('count(*) as total'))
                ->groupBy('queue')
                ->orderBy('queue')
                ->get();

            if ($rows->isEmpty()) {
                $this->line('No pending jobs.');
            } else {
                foreach ($rows as $row) {
                    $this->line("{$row->queue}: {$row->total}");
                }
            }
        }

        if (DB::getSchemaBuilder()->hasTable('failed_jobs')) {
            $this->line('');
            $this->line('Failed jobs: '.DB::table('failed_jobs')->count());
        }

        return self::SUCCESS;
    }
}
