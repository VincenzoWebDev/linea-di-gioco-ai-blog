<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\RegionCoordinateResolver;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ResolveGeopoliticalCoordinatesCommand extends Command
{
    protected $signature = 'geopolitical:resolve-coordinates {--force : Ricalcola anche coordinate già presenti}';

    protected $description = 'Risolve e salva lat/long per tensioni geopolitiche mappabili';

    public function handle(RegionCoordinateResolver $resolver): int
    {
        $force = (bool) $this->option('force');
        $updated = 0;
        $skipped = 0;
        $cleared = 0;

        GeopoliticalTension::query()
            ->with('featuredArticle:id,title,summary,content')
            ->orderBy('id')
            ->chunkById(50, function ($tensions) use ($resolver, $force, &$updated, &$skipped, &$cleared) {
                foreach ($tensions as $tension) {
                    if (! $force && $tension->latitude !== null && $tension->longitude !== null) {
                        $skipped++;

                        continue;
                    }

                    $context = $this->buildContext($tension->featuredArticle);
                    $point = $resolver->resolve($tension->region_name, $context);

                    if ($point === null) {
                        if ($tension->latitude !== null || $tension->longitude !== null) {
                            $tension->update(['latitude' => null, 'longitude' => null]);
                            $cleared++;
                        } else {
                            $skipped++;
                        }

                        continue;
                    }

                    $tension->update([
                        'latitude' => $point['lat'],
                        'longitude' => $point['long'],
                    ]);
                    $updated++;
                }
            });

        $this->info("Coordinate aggiornate: {$updated}");
        $this->line("Senza mappa (non mappabili): {$skipped}");
        $this->line("Coordinate rimosse: {$cleared}");

        return self::SUCCESS;
    }

    private function buildContext(?Article $article): string
    {
        if (! $article) {
            return '';
        }

        return trim(implode(' ', array_filter([
            $article->title,
            $article->summary,
            $article->content ? Str::limit(strip_tags($article->content), 500, '') : null,
        ])));
    }
}
