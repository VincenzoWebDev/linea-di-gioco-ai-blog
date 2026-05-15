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
                'name' => 'Reuters Top News',
                'type' => 'rss',
                'endpoint' => 'http://feeds.reuters.com/reuters/topNews',
                'is_active' => true,
                'poll_interval_minutes' => 10,
            ],
            [
                'name' => 'BBC World',
                'type' => 'rss',
                'endpoint' => 'https://feeds.bbci.co.uk/news/world/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 10,
            ],
            [
                'name' => 'BBC Middle East',
                'type' => 'rss',
                'endpoint' => 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 10,
            ],
            [
                'name' => 'Al Jazeera World',
                'type' => 'rss',
                'endpoint' => 'https://www.aljazeera.com/xml/rss/all.xml',
                'is_active' => true,
                'poll_interval_minutes' => 10,
            ],
            [
                'name' => 'UN News Top Stories',
                'type' => 'rss',
                'endpoint' => 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 15,
            ],
            [
                'name' => 'Foreign Affairs Geopolitics',
                'type' => 'rss',
                'endpoint' => 'https://www.foreignaffairs.com/feeds/topic/Geopolitics/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'The Diplomat',
                'type' => 'rss',
                'endpoint' => 'https://thediplomat.com/feed/',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'War on the Rocks',
                'type' => 'rss',
                'endpoint' => 'https://warontherocks.com/feed/',
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
                'name' => 'Guardian World',
                'type' => 'rss',
                'endpoint' => 'https://www.theguardian.com/world/rss',
                'is_active' => true,
                'poll_interval_minutes' => 10,
            ],
            [
                'name' => 'Guardian Politics',
                'type' => 'rss',
                'endpoint' => 'https://www.theguardian.com/politics/rss',
                'is_active' => true,
                'poll_interval_minutes' => 10,
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
