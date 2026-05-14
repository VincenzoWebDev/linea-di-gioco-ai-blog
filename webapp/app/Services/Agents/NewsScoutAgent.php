<?php

namespace App\Services\Agents;

use App\Models\NewsSource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class NewsScoutAgent
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function discover(NewsSource $source): array
    {
        if ($source->type === 'mock') {
            return $this->mockNews($source);
        }

        if ($source->type === 'rss') {
            return $this->rssNews($source);
        }

        return [];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function mockNews(NewsSource $source): array
    {
        $now = Carbon::now();
        $seed = Str::slug($source->name);

        return [
            [
                'external_id' => $seed.'-'.$now->format('YmdHi').'-1',
                'title' => 'Ultima ora '.$source->name.': aggiornamento '.$now->format('H:i'),
                'summary' => 'Segnalazione rapida generata in mock per testare la pipeline AI.',
                'url' => rtrim($source->endpoint, '/').'/'.$seed.'-'.$now->timestamp.'-1',
                'published_at' => $now->toIso8601String(),
            ],
            [
                'external_id' => $seed.'-'.$now->format('YmdHi').'-2',
                'title' => 'Approfondimento '.$source->name.' su sicurezza energetica europea',
                'summary' => 'Seconda notizia mock con focus geopolitico per controllare deduplica e sanitizzazione.',
                'url' => rtrim($source->endpoint, '/').'/'.$seed.'-'.$now->timestamp.'-2',
                'published_at' => $now->subMinutes(2)->toIso8601String(),
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function rssNews(NewsSource $source): array
    {
        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => 'LineaDiGiocoBot/1.0 (+https://lineadigioco.local)',
                    'Accept' => 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
                ])
                ->get($source->endpoint);

            if (! $response->successful()) {
                Log::warning('ai_news_rss_fetch_failed', [
                    'source_id' => $source->id,
                    'source_name' => $source->name,
                    'endpoint' => $source->endpoint,
                    'status' => $response->status(),
                ]);

                return [];
            }

            $xml = $response->body();
            $items = $this->parseRssItems($xml);
            $limit = (int) config('ai_news.max_items_per_source', 10);

            return array_slice($items, 0, max($limit, 1));
        } catch (Throwable $exception) {
            Log::warning('ai_news_rss_fetch_exception', [
                'source_id' => $source->id,
                'source_name' => $source->name,
                'endpoint' => $source->endpoint,
                'message' => $exception->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function parseRssItems(string $xml): array
    {
        libxml_use_internal_errors(true);
        $feed = simplexml_load_string($xml);
        libxml_clear_errors();

        if (! $feed) {
            Log::warning('ai_news_rss_parse_failed');
            return [];
        }

        $rawItems = [];
        if (isset($feed->channel->item)) {
            $rawItems = iterator_to_array($feed->channel->item);
        } elseif (isset($feed->entry)) {
            $rawItems = iterator_to_array($feed->entry);
        }

        $normalized = [];

        foreach ($rawItems as $item) {
            try {
                $title = trim((string) ($item->title ?? ''));
                $summary = trim((string) ($item->description ?? $item->summary ?? $item->content ?? ''));
                $url = $this->extractItemUrl($item);
                $publishedAt = trim((string) ($item->pubDate ?? $item->published ?? $item->updated ?? now()->toIso8601String()));

                if ($title === '' || $url === '') {
                    continue;
                }

                $externalId = trim((string) ($item->guid ?? $item->id ?? ''));
                if ($externalId === '') {
                    $externalId = hash('sha256', $title.'|'.$url.'|'.$publishedAt);
                }

                $normalized[] = [
                    'external_id' => $externalId,
                    'title' => strip_tags($title),
                    'summary' => Str::limit(strip_tags($summary), 500, ''),
                    'url' => $url,
                    'published_at' => Carbon::parse($publishedAt)->toIso8601String(),
                ];
            } catch (Throwable) {
                continue;
            }
        }

        return $normalized;
    }

    private function extractItemUrl(mixed $item): string
    {
        $link = $item->link ?? null;
        if (! $link) {
            return '';
        }

        $textLink = trim((string) $link);
        if ($textLink !== '') {
            return $textLink;
        }

        $attributes = $link->attributes();
        if ($attributes && isset($attributes['href'])) {
            return trim((string) $attributes['href']);
        }

        return '';
    }
}
