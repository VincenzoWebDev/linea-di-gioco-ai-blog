<?php

namespace App\Console\Commands;

use App\Models\GeopoliticalTension;
use App\Services\GeopoliticalTensionService;
use App\Services\RiskScoreCalibrationService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RecalibrateGeopoliticalRiskCommand extends Command
{
    protected $signature = 'geopolitical:recalibrate-risk';

    protected $description = 'Ricalibra i risk_score delle tensioni geopolitiche esistenti';

    public function handle(
        RiskScoreCalibrationService $calibration,
        GeopoliticalTensionService $tensionService
    ): int {
        $updated = 0;

        GeopoliticalTension::query()
            ->with('featuredArticle:id,title,summary,content')
            ->orderBy('id')
            ->chunkById(50, function ($tensions) use ($calibration, $tensionService, &$updated): void {
                foreach ($tensions as $tension) {
                    $article = $tension->featuredArticle;
                    $context = trim(implode(' ', array_filter([
                        $article?->title,
                        $article?->summary,
                        $article?->content ? Str::limit(strip_tags($article->content), 600, '') : null,
                    ])));

                    $calibrated = $calibration->calibrate(
                        (int) $tension->risk_score,
                        $context,
                        (string) $tension->status_label
                    );

                    if ($calibrated === (int) $tension->risk_score) {
                        continue;
                    }

                    $tension->update(['risk_score' => $calibrated]);
                    $updated++;
                }
            });

        $tensionService->clearHeaderCache();

        $this->info("Aggiornate {$updated} tensioni.");

        return self::SUCCESS;
    }
}
