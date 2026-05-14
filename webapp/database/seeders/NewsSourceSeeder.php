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
            [
                'name' => 'Al Jazeera News',
                'type' => 'rss',
                'endpoint' => 'https://www.aljazeera.com/xml/rss/all.xml',
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
            ->where(function ($query) {
                $query->whereIn('name', ['Mock Sport Feed', 'Mock Tech Feed'])
                    ->orWhere('type', 'mock')
                    ->orWhere('name', 'like', '%telegram%')
                    ->orWhere('endpoint', 'like', '%t.me/%')
                    ->orWhere('endpoint', 'like', '%telegram.%');
            })
            ->delete();
    }
}
