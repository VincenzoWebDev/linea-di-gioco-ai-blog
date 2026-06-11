<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\GeopoliticalTensionService;
use App\Services\News\IncomingNewsIngestService;
use App\Services\RiskScoreCalibrationService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RecalibrateNewsCommand extends Command
{
    protected $signature = 'ai-news:recalibrate {--dry-run : Esegue solo una simulazione senza modificare il database}';

    protected $description = 'Ricalibra il quality_score degli articoli e il risk_score delle relative tensioni geopolitiche';

    public function handle(
        IncomingNewsIngestService $ingestService,
        RiskScoreCalibrationService $calibrationService,
        GeopoliticalTensionService $tensionService
    ): int {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->info('[SIMULAZIONE] Modalità Dry-Run attiva. Nessuna modifica verrà salvata nel database.');
        }

        $articlesCount = 0;
        $qualityUpdatedCount = 0;
        $tensionsCount = 0;
        $tensionUpdatedCount = 0;

        Article::query()
            ->with(['categories', 'tension'])
            ->orderBy('id')
            ->chunkById(50, function ($articles) use ($ingestService, $calibrationService, $dryRun, &$articlesCount, &$qualityUpdatedCount, &$tensionsCount, &$tensionUpdatedCount): void {
                foreach ($articles as $article) {
                    $articlesCount++;

                    // 1. Ricalcola il Quality Score dell'articolo
                    $topic = $article->categories->pluck('name')->first() ?: 'geopolitica';
                    $newQualityScore = $ingestService->computeQualityScore(
                        (string) $article->title,
                        (string) $article->content,
                        (string) $topic,
                        (string) $article->source_url
                    );

                    $oldQualityScore = (float) $article->quality_score;
                    if (abs($newQualityScore - $oldQualityScore) > 0.01) {
                        $qualityUpdatedCount++;
                        $this->line(sprintf(
                            'Articolo ID: %d | "%s" | Quality Score: %s -> %s',
                            $article->id,
                            Str::limit($article->title, 40),
                            number_format($oldQualityScore, 2),
                            number_format($newQualityScore, 2)
                        ));

                        if (!$dryRun) {
                            $article->update(['quality_score' => $newQualityScore]);
                        }
                    }

                    // 2. Ricalcola il Risk Score della tensione geopolitica associata
                    $tension = $article->tension;
                    if ($tension) {
                        $tensionsCount++;

                        $context = trim(implode(' ', array_filter([
                            $article->title,
                            $article->summary,
                            $article->content ? Str::limit(strip_tags($article->content), 600, '') : null,
                        ])));

                        $newRiskScore = $calibrationService->calibrate(
                            (int) $tension->risk_score,
                            $context,
                            (string) $tension->status_label,
                            (string) $tension->trend_direction
                        );

                        $oldRiskScore = (int) $tension->risk_score;
                        if ($newRiskScore !== $oldRiskScore) {
                            $tensionUpdatedCount++;
                            $this->line(sprintf(
                                '  -> Tensione ID: %d (%s) | Risk Score: %d -> %d',
                                $tension->id,
                                $tension->region_name,
                                $oldRiskScore,
                                $newRiskScore
                            ));

                            if (!$dryRun) {
                                $tension->update(['risk_score' => $newRiskScore]);
                            }
                        }
                    }
                }
            });

        if ($tensionUpdatedCount > 0 && !$dryRun) {
            $this->info('Ricalcolo delle coordinate mappa in corso...');
            $tensionService->backfillMapCoordinates();
            $tensionService->clearHeaderCache();
        }

        $this->info("\n--- RIEPILOGO ---");
        $this->info("Articoli totali analizzati: {$articlesCount}");
        $this->info($dryRun
            ? "Articoli con Quality Score da aggiornare: {$qualityUpdatedCount}"
            : "Articoli con Quality Score aggiornati: {$qualityUpdatedCount}"
        );
        $this->info("Tensioni associate analizzate: {$tensionsCount}");
        $this->info($dryRun
            ? "Tensioni con Risk Score da aggiornare: {$tensionUpdatedCount}"
            : "Tensioni con Risk Score aggiornate: {$tensionUpdatedCount}"
        );

        return self::SUCCESS;
    }
}
