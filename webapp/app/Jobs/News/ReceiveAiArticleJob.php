<?php

namespace App\Jobs\News;

use App\Enums\IncomingNewsStatus;
use App\Models\AgentRun;
use App\Models\IncomingNews;
use App\Models\NewsSource;
use App\Services\ArticleValidationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class ReceiveAiArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 90, 300];

    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        public array $payload,
        public string $idempotencyKey
    ) {
    }

    public function handle(ArticleValidationService $validationService): void
    {
        $sourceName = trim((string) ($this->payload['source_name'] ?? 'CrewAI Dispatch'));
        $sourceUrl = trim((string) ($this->payload['source_url'] ?? 'https://dispatch.local'));

        $source = NewsSource::query()->firstOrCreate(
            ['name' => $sourceName],
            [
                'type' => 'api',
                'endpoint' => $sourceUrl,
                'is_active' => true,
                'poll_interval_minutes' => 60,
            ]
        );

        $providedScore = (float) ($this->payload['quality_score'] ?? 0);
        $computedScore = $this->computeQualityScore(
            (string) ($this->payload['title'] ?? ''),
            (string) ($this->payload['content'] ?? ''),
            (string) ($this->payload['topic'] ?? 'geopolitica'),
            (string) ($this->payload['source_url'] ?? '')
        );
        $finalScore = max($providedScore, $computedScore);

        $sanitizedPayload = [
            'title' => (string) ($this->payload['title'] ?? ''),
            'summary' => (string) ($this->payload['summary'] ?? ''),
            'content' => (string) ($this->payload['content'] ?? ''),
            'topic' => (string) ($this->payload['topic'] ?? 'geopolitica'),
            'categories' => $this->normalizeCategories($this->payload['categories'] ?? []),
            'quality_score' => $finalScore,
            'source_url' => $sourceUrl,
            'rewrite_mode' => (string) ($this->payload['rewrite_mode'] ?? 'dispatch'),
            'language' => (string) ($this->payload['language'] ?? 'it'),
        ];
        if (is_array($this->payload['geopolitical_tension'] ?? null)) {
            $sanitizedPayload['geopolitical_tension'] = $this->payload['geopolitical_tension'];
        }
        $requiresItalianRewrite = $validationService->needsItalianRewrite($sanitizedPayload);

        $publishedAt = isset($this->payload['published_at'])
            ? Carbon::parse((string) $this->payload['published_at'])
            : now();

        $incoming = IncomingNews::query()->firstOrCreate(
            ['fingerprint' => $this->idempotencyKey],
            [
                'news_source_id' => $source->id,
                'external_id' => (string) ($this->payload['external_id'] ?? ''),
                'url' => $sourceUrl,
                'title' => (string) ($this->payload['title'] ?? ''),
                'summary' => (string) ($this->payload['summary'] ?? null),
                'source_content' => (string) ($this->payload['content'] ?? ''),
                'raw_payload' => $this->payload,
                'sanitized_payload' => $sanitizedPayload,
                'published_at' => $publishedAt,
                'sanitized_at' => $requiresItalianRewrite ? null : now(),
                'status' => $requiresItalianRewrite ? IncomingNewsStatus::QUEUED : IncomingNewsStatus::SANITIZED,
                'quality_score' => $finalScore,
            ]
        );

        if (! $incoming->wasRecentlyCreated) {
            return;
        }

        AgentRun::query()->create([
            'incoming_news_id' => $incoming->id,
            'agent_name' => 'DispatchAgent',
            'prompt_version' => 'dispatch-v1',
            'status' => 'success',
            'result_payload' => [
                'rewrite_mode' => $sanitizedPayload['rewrite_mode'],
                'idempotency_key' => $this->idempotencyKey,
            ],
        ]);

        if ($requiresItalianRewrite) {
            SanitizeIncomingNewsJob::dispatch($incoming->id)
                ->onQueue(config('ai_news.queues.sanitize', 'news-sanitize'));

            return;
        }

        ValidateSanitizedArticleJob::dispatch($incoming->id)
            ->onQueue(config('ai_news.queues.publish', 'news-publish'));
    }

    private function computeQualityScore(string $title, string $content, string $topic, string $sourceUrl): float
    {
        $score = 35.0;

        $titleLen = mb_strlen(trim($title));
        if ($titleLen >= 24) {
            $score += 15;
        } elseif ($titleLen >= 14) {
            $score += 8;
        }

        $contentLen = mb_strlen(trim($content));
        if ($contentLen >= 1200) {
            $score += 25;
        } elseif ($contentLen >= 700) {
            $score += 20;
        } elseif ($contentLen >= 350) {
            $score += 12;
        }

        $lowerContent = mb_strtolower($content);

        $lowerTopic = mb_strtolower($topic);
        if (
            str_contains($lowerTopic, 'geopolit') ||
            str_contains($lowerContent, 'nato') ||
            str_contains($lowerContent, 'diplom') ||
            str_contains($lowerContent, 'sanzion') ||
            str_contains($lowerContent, 'conflict') ||
            str_contains($lowerContent, 'war')
        ) {
            $score += 10;
        }

        if (filter_var($sourceUrl, FILTER_VALIDATE_URL)) {
            $score += 5;
        }

        return min($score, 100.0);
    }

    /**
     * @param mixed $categories
     * @return array<int, string>
     */
    private function normalizeCategories(mixed $categories): array
    {
        if (! is_array($categories)) {
            return [];
        }

        $normalized = collect($categories)
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->map(fn ($value) => mb_substr($value, 0, 120))
            ->unique(fn ($value) => mb_strtolower($value))
            ->values()
            ->take(5)
            ->all();

        return $normalized;
    }
}
