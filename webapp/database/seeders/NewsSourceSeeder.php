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

            // =========================
            // 🔴 BREAKING GLOBAL NEWS
            // =========================
            [
                'name' => 'BBC World News',
                'type' => 'rss',
                'endpoint' => 'http://feeds.bbci.co.uk/news/world/rss.xml',
                'is_active' => true,
                'poll_interval_minutes' => 15,
            ],
            [
                'name' => 'Al Jazeera English',
                'type' => 'rss',
                'endpoint' => 'https://www.aljazeera.com/xml/rss/all.xml',
                'is_active' => true,
                'poll_interval_minutes' => 15,
            ],

            // =========================
            // 🌍 GLOBAL / EUROPE MEDIA
            // =========================
            [
                'name' => 'Deutsche Welle',
                'type' => 'rss',
                'endpoint' => 'https://rss.dw.com/rdf/rss-en-all',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'France 24 English',
                'type' => 'rss',
                'endpoint' => 'https://www.france24.com/en/rss',
                'is_active' => true,
                'poll_interval_minutes' => 20,
            ],
            [
                'name' => 'Euronews',
                'type' => 'rss',
                'endpoint' => 'https://www.euronews.com/rss?level=theme&name=news',
                'is_active' => true,
                'poll_interval_minutes' => 25,
            ],

            // =========================
            // 🟡 POLITICS / POWER CENTERS
            // =========================
            [
                'name' => 'Politico Europe',
                'type' => 'rss',
                'endpoint' => 'https://www.politico.eu/feed/',
                'is_active' => true,
                'poll_interval_minutes' => 30,
            ],
            [
                'name' => 'The Guardian World',
                'type' => 'rss',
                'endpoint' => 'https://www.theguardian.com/world/rss',
                'is_active' => true,
                'poll_interval_minutes' => 30,
            ],

            // =========================
            // 🔵 ASIA / CINA
            // =========================
            [
                'name' => 'South China Morning Post (Asia)',
                'type' => 'rss',
                'endpoint' => 'https://www.scmp.com/rss/91/feed',
                'is_active' => true,
                'poll_interval_minutes' => 30,
            ],

            // =========================
            // 🧠 GEOPOLITICAL ANALYSIS
            // =========================
            [
                'name' => 'International Crisis Group',
                'type' => 'rss',
                'endpoint' => 'https://www.crisisgroup.org/rss/139',
                'is_active' => true,
                'poll_interval_minutes' => 120,
            ],
            [
                'name' => 'The Diplomat',
                'type' => 'rss',
                'endpoint' => 'https://thediplomat.com/feed/',
                'is_active' => true,
                'poll_interval_minutes' => 90,
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
