<?php

namespace App\Console;

use App\Jobs\News\FetchNewsJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $interval = min(max((int) config('ai_news.schedule_every_minutes', 10), 1), 59);

        $schedule->job(new FetchNewsJob(), config('ai_news.queues.ingest', 'news-ingest'))
            ->cron("*/{$interval} * * * *")
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
