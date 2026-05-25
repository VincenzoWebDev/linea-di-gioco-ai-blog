<?php

namespace Database\Seeders;

use App\Models\NewsSource;
use Illuminate\Database\Seeder;

class NewsSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            [
                'name' => 'Foreign Affairs Geopolitics',
                'type' => 'rss',
                'endpoint' => 'https://www.foreignaffairs.com/feeds/topic/Geopolitics/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Geopolitical Futures',
                'type' => 'rss',
                'endpoint' => 'https://geopoliticalfutures.com/feed/',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Google News - Guerra e conflitti globali',
                'type' => 'rss',
                'endpoint' => 'https://news.google.com/rss/search?q=war+OR+conflict+OR+military+OR+invasion+OR+ceasefire&hl=en&gl=US&ceid=US:en',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Google News - Russia / Ucraina / Est Europa',
                'type' => 'rss',
                'endpoint' => 'https://news.google.com/rss/search?q=ukraine+OR+russia+OR+kiev+OR+moscow+OR+eastern+europe+war&hl=en&gl=US&ceid=US:en',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Google News - Medio Oriente',
                'type' => 'rss',
                'endpoint' => 'https://news.google.com/rss/search?q=gaza+OR+israel+OR+palestine+OR+iran+OR+syria+OR+lebanon&hl=en&gl=US&ceid=US:en',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Google News - Cina / Taiwan / Asia-Pacific',
                'type' => 'rss',
                'endpoint' => 'https://news.google.com/rss/search?q=china+OR+taiwan+OR+south+china+sea+OR+xi+jinping+OR+asia+security&hl=en&gl=US&ceid=US:en',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Google News - USA / NATO / Occidente',
                'type' => 'rss',
                'endpoint' => 'https://news.google.com/rss/search?q=usa+OR+nato+OR+washington+OR+pentagon+OR+europe+security+policy&hl=en&gl=US&ceid=US:en',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
        ];

        foreach ($sources as $source) {
            NewsSource::query()->updateOrCreate(
                ['name' => $source['name']],
                $source
            );
        }

        NewsSource::query()
            ->whereIn('name', ['Mock Sport Feed', 'Mock Tech Feed', 'Al Jazeera News'])
            ->delete();

        NewsSource::query()
            ->where(function ($query) {
                $query->where('type', 'mock')
                    ->orWhere('name', 'like', '%telegram%')
                    ->orWhere('endpoint', 'like', '%t.me/%')
                    ->orWhere('endpoint', 'like', '%telegram.%');
            })
            ->delete();
    }
}
