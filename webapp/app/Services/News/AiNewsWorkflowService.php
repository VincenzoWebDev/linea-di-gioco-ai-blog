<?php

namespace App\Services\News;

use App\Models\Article;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

class AiNewsWorkflowService
{
    public function isAllowedTriggerTime(\DateTimeInterface|string|null $triggeredAt = null): bool
    {
        $time = $this->normalizeTime($triggeredAt);
        $allowedHours = $this->allowedTriggerHours();

        return in_array($time->hour, $allowedHours, true)
            && $time->minute === 0;
    }

    /**
     * @return array{session_key: string, triggered_at: string, trigger_hour: int, session_ai_quota: int}
     */
    public function sessionMetadata(\DateTimeInterface|string|null $triggeredAt = null): array
    {
        $time = $this->normalizeTime($triggeredAt);
        $usedToday = Article::query()
            ->whereNotNull('ai_image_generated_at')
            ->whereDate('ai_image_generated_at', $time->toDateString())
            ->count();

        $dailyBudget = max((int) config('ai_news.workflow.daily_ai_image_budget', 10), 0);
        $sessionLimit = max((int) config('ai_news.workflow.max_ai_images_per_session', 3), 0);
        $remainingBudget = max($dailyBudget - $usedToday, 0);

        return [
            'session_key' => $time->format('YmdH'),
            'triggered_at' => $time->toIso8601String(),
            'trigger_hour' => $time->hour,
            'session_ai_quota' => min($sessionLimit, $remainingBudget),
        ];
    }

    public function synchronizeSessionAssignments(Article $article): void
    {
        if (! is_string($article->workflow_session_key) || trim($article->workflow_session_key) === '') {
            return;
        }

        $lock = Cache::lock('ai_news:session_assignments:'.$article->workflow_session_key, 10);

        $lock->block(5, function () use ($article): void {
            $sessionArticles = Article::query()
                ->where('workflow_session_key', $article->workflow_session_key)
                ->leftJoin('geopolitical_tensions', 'geopolitical_tensions.featured_article_id', '=', 'articles.id')
                ->orderByRaw('COALESCE(geopolitical_tensions.risk_score, 0) DESC')
                ->orderBy('articles.id')
                ->get([
                    'articles.id',
                    'articles.workflow_session_ai_quota',
                    'articles.ai_image_generated_at',
                    'articles.image_generation_mode',
                ]);

            if ($sessionArticles->isEmpty()) {
                return;
            }

            $quota = max((int) $sessionArticles->max('workflow_session_ai_quota'), 0);
            $generatedIds = $sessionArticles
                ->filter(fn ($item) => $item->ai_image_generated_at !== null)
                ->pluck('id')
                ->all();
            $remainingQuota = max($quota - count($generatedIds), 0);
            $pendingAiIds = $sessionArticles
                ->pluck('id')
                ->reject(fn ($id) => in_array($id, $generatedIds, true))
                ->take($remainingQuota)
                ->all();

            foreach ($sessionArticles as $index => $sessionArticle) {
                $mode = in_array($sessionArticle->id, $generatedIds, true) || in_array($sessionArticle->id, $pendingAiIds, true)
                    ? 'ai'
                    : 'fallback';

                Article::query()
                    ->whereKey($sessionArticle->id)
                    ->update([
                        'workflow_session_rank' => $index + 1,
                        'image_generation_mode' => $mode,
                    ]);
            }
        });
    }

    /**
     * @return list<int>
     */
    public function allowedTriggerHours(): array
    {
        return collect(config('ai_news.workflow.trigger_hours', [5, 9, 13, 17, 21]))
            ->map(fn ($hour) => (int) $hour)
            ->filter(fn ($hour) => $hour >= 0 && $hour <= 23)
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    private function normalizeTime(\DateTimeInterface|string|null $triggeredAt = null): CarbonImmutable
    {
        $timezone = (string) config('app.timezone', 'UTC');

        if ($triggeredAt instanceof \DateTimeInterface) {
            return CarbonImmutable::instance(\Carbon\Carbon::instance($triggeredAt))->setTimezone($timezone);
        }

        if (is_string($triggeredAt) && trim($triggeredAt) !== '') {
            return CarbonImmutable::parse($triggeredAt)->setTimezone($timezone);
        }

        return CarbonImmutable::now($timezone);
    }
}
