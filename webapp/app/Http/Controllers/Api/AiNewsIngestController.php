<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\News\ReceiveAiArticleJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiNewsIngestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string', 'min:80'],
            'topic' => ['nullable', 'string', 'max:120'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'max:120'],
            'quality_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'source_url' => ['nullable', 'string', 'max:2048'],
            'source_name' => ['nullable', 'string', 'max:255'],
            'rewrite_mode' => ['nullable', 'string', 'max:40'],
            'language' => ['nullable', 'string', 'max:8'],
            'external_id' => ['nullable', 'string', 'max:255'],
            'published_at' => ['nullable', 'date'],
            'geopolitical_tension' => ['nullable', 'array'],
            'geopolitical_tension.region_name' => ['required_with:geopolitical_tension', 'string', 'max:120'],
            'geopolitical_tension.risk_score' => ['required_with:geopolitical_tension', 'integer', 'min:1', 'max:100'],
            'geopolitical_tension.trend_direction' => ['required_with:geopolitical_tension', 'in:rising,falling,stable'],
            'geopolitical_tension.status_label' => ['required_with:geopolitical_tension', 'string', 'max:80'],
            'geopolitical_tension.tension_summary' => ['required_with:geopolitical_tension', 'string', 'max:160'],
        ]);

        $sourceUrl = (string) ($validated['source_url'] ?? '');

        $idempotencyKey = hash(
            'sha256',
            mb_strtolower(
                (string) $validated['title'].'|'.
                $sourceUrl.'|'.
                Str::limit((string) $validated['content'], 1200, '')
            )
        );

        ReceiveAiArticleJob::dispatch($validated, $idempotencyKey)
            ->onQueue(config('ai_news.queues.ingest_receive', 'news-ingest'));

        return response()->json([
            'accepted' => true,
            'queued' => true,
            'idempotency_key' => $idempotencyKey,
        ]);
    }
}
