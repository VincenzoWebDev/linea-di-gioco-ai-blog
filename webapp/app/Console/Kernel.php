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
        $newsTriggerHours = collect(config('ai_news.workflow.trigger_hours', [5, 9, 13, 17, 21]))
            ->map(fn ($hour) => (int) $hour)
            ->filter(fn ($hour) => $hour >= 0 && $hour <= 23)
            ->unique()
            ->sort()
            ->values()
            ->implode(',');
        $newsTriggerHours = $newsTriggerHours !== '' ? $newsTriggerHours : '5,9,13,17,21';

        $schedule->job(new FetchNewsJob, config('ai_news.queues.ingest', 'news-ingest'))
            ->cron("0 {$newsTriggerHours} * * *")
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
