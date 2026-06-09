<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class GlobalTensionTrendService
{
    private const CACHE_KEY = 'global_tension_trend';

    /**
     * Recupera o calcola l'andamento della tensione globale degli ultimi 7 giorni con cache.
     *
     * @return array<string, mixed>
     */
    public function getTrend(Collection $activeOperations): array
    {
        return Cache::remember(self::CACHE_KEY, now()->addHours(24), function () use ($activeOperations) {
            return $this->calculate($activeOperations);
        });
    }

    /**
     * Calcola il trend storico fittizio ad alta fedeltà basandosi sullo stato e trend odierno.
     */
    private function calculate(Collection $activeOperations): array
    {
        $trendPoints = [];
        $daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $daysOfWeek[(int) $date->format('w')];
            $dayScores = [];

            foreach ($activeOperations as $op) {
                $risk = (int) ($op['risk_score'] ?? 50);
                $trend = $op['trend_direction'] ?? 'stable';
                $updatedAt = isset($op['updated_at']) ? \Carbon\Carbon::parse($op['updated_at']) : now();

                $diffDays = $date->diffInDays($updatedAt, false);

                if ($diffDays > 0) {
                    $delta = min(15, (int) ($diffDays * 1.5));
                    if ($trend === 'rising') {
                        $score = max(15, $risk - $delta);
                    } elseif ($trend === 'falling') {
                        $score = min(95, $risk + $delta);
                    } else {
                        $score = max(10, min(100, $risk + (int) (sin($i + $risk) * 1.2)));
                    }
                } else {
                    $score = $risk;
                }
                $dayScores[] = $score;
            }

            $average = ! empty($dayScores) ? array_sum($dayScores) / count($dayScores) : 50;
            $trendPoints[] = [
                'name' => $dayName,
                'date' => $date->format('d/m'),
                'Tensione' => round($average, 1),
            ];
        }

        $firstVal = $trendPoints[0]['Tensione'] ?? 50;
        $lastVal = $trendPoints[6]['Tensione'] ?? 50;
        $direction = 'stable';

        if ($lastVal > $firstVal + 0.3) {
            $direction = 'rising';
        } elseif ($lastVal < $firstVal - 0.3) {
            $direction = 'falling';
        }

        return [
            'points' => $trendPoints,
            'direction' => $direction,
            'current_average' => $lastVal,
            'delta' => round($lastVal - $firstVal, 1),
        ];
    }
}
