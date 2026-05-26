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
            // === ANALISI DI ALTO LIVELLO ===
            [
                'name' => 'Foreign Affairs Geopolitics',
                'type' => 'rss',
                'endpoint' => 'https://www.foreignaffairs.com/feeds/topic/Geopolitics/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 40,
            ],
            [
                'name' => 'SIPRI',
                'type' => 'rss',
                'endpoint' => 'https://www.sipri.org/rss/combined.xml',
                'is_active' => true,
                'poll_interval_minutes' => 90,
            ],
            [
                'name' => 'International Crisis Group',
                'type' => 'rss',
                'endpoint' => 'https://www.crisisgroup.org/rss/139',
                'is_active' => true,
                'poll_interval_minutes' => 70,
            ],
            [
                'name' => 'CFR',
                'type' => 'rss',
                'endpoint' => 'https://www.cfr.org/feed',
                'is_active' => true,
                'poll_interval_minutes' => 50,
            ],

            // === NEWS VELOCI E BREAKING ===
            [
                'name' => 'BBC World News',
                'type' => 'rss',
                'endpoint' => 'http://feeds.bbci.co.uk/news/world/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Al Jazeera English',
                'type' => 'rss',
                'endpoint' => 'https://www.aljazeera.com/xml/rss/all.xml',
                'is_active' => true,
                'poll_interval_minutes' => 25,
            ],

            // === FOCUS GEOPOLITICO REGIONALE ===
            [
                'name' => 'The Diplomat (Asia-Pacific)',
                'type' => 'rss',
                'endpoint' => 'https://thediplomat.com/feed/',
                'is_active' => true,
                'poll_interval_minutes' => 40,
            ],
            [
                'name' => 'ECFR',
                'type' => 'rss',
                'endpoint' => 'https://ecfr.eu/feed/',
                'is_active' => true,
                'poll_interval_minutes' => 50,
            ],

            // === MEDIO ORIENTE e AFRICA ===
            [
                'name' => 'Crisis Group - Middle East & North Africa',
                'type' => 'rss',
                'endpoint' => 'https://www.crisisgroup.org/rss/81',
                'is_active' => true,
                'poll_interval_minutes' => 60,
            ],
            [
                'name' => 'Crisis Group - Africa',
                'type' => 'rss',
                'endpoint' => 'https://www.crisisgroup.org/rss/1',
                'is_active' => true,
                'poll_interval_minutes' => 60,
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
