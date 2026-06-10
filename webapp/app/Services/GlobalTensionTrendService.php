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
     * @param Collection $activeOperations
     * @return array<string, mixed>
     */
    public function getTrend(Collection $activeOperations): array
    {
        return Cache::remember(self::CACHE_KEY, now()->addHours(24), function () use ($activeOperations) {
            return $this->calculate($activeOperations);
        });
    }

    /**
     * Calcola il trend storico ad alta fedeltà basandosi sulle proiezioni calendarizzate.
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
                
                // Normalizza le date a inizio giornata per calcolare i giorni di calendario esatti
                $dateStart = $date->copy()->startOfDay();
                $updatedAtStart = $updatedAt->copy()->startOfDay();
                
                if ($dateStart->lessThan($updatedAtStart)) {
                    // La data del loop è passata rispetto all'aggiornamento: proietta retroattivamente!
                    $diffDays = $dateStart->diffInDays($updatedAtStart);
                    $delta = min(15, (int) ($diffDays * 1.5));
                    
                    if ($trend === 'rising') {
                        $score = max(15, $risk - $delta);
                    } elseif ($trend === 'falling') {
                        $score = min(95, $risk + $delta);
                    } else {
                        $score = max(10, min(100, $risk + (int) (sin($i * 1.5 + $risk) * 2.0)));
                    }
                } else {
                    // La data del loop è successiva o uguale all'aggiornamento: mantieni il valore attuale
                    $score = $risk;
                }
                $dayScores[] = $score;
            }
            
            $average = !empty($dayScores) ? array_sum($dayScores) / count($dayScores) : 50;
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

        // Calcolo delle Tendenze Regionali Dinamiche degli ultimi 7 giorni
        $allTensions = \App\Models\GeopoliticalTension::query()->get(['region_name', 'risk_score', 'trend_direction', 'latitude', 'longitude', 'updated_at']);
        
        $macroRegions = [
            'Europa & Eurasia' => ['label' => 'Europa & Eurasia', 'key' => 'Europa'],
            'Medio Oriente & Nord Africa' => ['label' => 'Medio Oriente & Nord Africa', 'key' => 'Medio Oriente'],
            'Asia-Pacifico' => ['label' => 'Asia-Pacifico', 'key' => 'Asia-Pacifico'],
            'Africa Subsahariana' => ['label' => 'Africa Subsahariana', 'key' => 'Africa'],
            'Americhe & Global' => ['label' => 'Americhe & Global', 'key' => 'Americhe'],
        ];

        $regionTensions = [];
        foreach ($allTensions as $t) {
            $macroKey = $this->classifyMacroRegion($t->region_name, $t->latitude, $t->longitude);
            $regionTensions[$macroKey][] = $t;
        }

        $formattedRegions = [];
        foreach ($macroRegions as $regName => $config) {
            $key = $config['key'];
            $tensionsInReg = $regionTensions[$key] ?? [];
            
            $scoresToday = [];
            $scoresPast = [];

            if (!empty($tensionsInReg)) {
                foreach ($tensionsInReg as $t) {
                    $risk = (int) $t->risk_score;
                    $trend = $t->trend_direction ?? 'stable';
                    $updatedAt = $t->updated_at ? \Carbon\Carbon::parse($t->updated_at) : now();
                    
                    // Oggi
                    $scoresToday[] = $risk;
                    
                    // 6 giorni fa
                    $updatedAtStart = $updatedAt->copy()->startOfDay();
                    $pastDateStart = now()->subDays(6)->startOfDay();
                    
                    if ($pastDateStart->lessThan($updatedAtStart)) {
                        $diffDays = $pastDateStart->diffInDays($updatedAtStart);
                        $delta = min(15, (int) ($diffDays * 1.5));
                        
                        if ($trend === 'rising') {
                            $pastScore = max(15, $risk - $delta);
                        } elseif ($trend === 'falling') {
                            $pastScore = min(95, $risk + $delta);
                        } else {
                            $pastScore = max(10, min(100, $risk + (int) (sin(6 * 1.5 + $risk) * 2.0)));
                        }
                    } else {
                        $pastScore = $risk;
                    }
                    $scoresPast[] = $pastScore;
                }

                $avgToday = array_sum($scoresToday) / count($scoresToday);
                $avgPast = array_sum($scoresPast) / count($scoresPast);
            } else {
                $avgToday = 15;
                $avgPast = 15;
            }

            // Calcola trend regionale
            $regDirection = 'stable';
            if ($avgToday > $avgPast + 0.3) {
                $regDirection = 'rising';
            } elseif ($avgToday < $avgPast - 0.3) {
                $regDirection = 'falling';
            }

            $formattedRegions[] = [
                'name' => $config['label'],
                'score' => (int) round($avgToday),
                'direction' => $regDirection,
            ];
        }
        
        return [
            'points' => $trendPoints,
            'direction' => $direction,
            'current_average' => $lastVal,
            'delta' => round($lastVal - $firstVal, 1),
            'macro_regions' => $formattedRegions,
        ];
    }

    /**
     * Classifica dinamicamente una tensione in una macro-regione geopolitica globale.
     */
    private function classifyMacroRegion(string $regionName, ?float $lat, ?float $lng): string
    {
        $name = mb_strtolower($regionName);

        // 1. Classificazione semantica tramite parole chiave
        if (str_contains($name, 'ucraina') || str_contains($name, 'russia') || str_contains($name, 'balkans') || str_contains($name, 'balcani') || str_contains($name, 'polonia') || str_contains($name, 'poland') || str_contains($name, 'europe') || str_contains($name, 'unione europea') || str_contains($name, 'bruxelles') || str_contains($name, 'francia') || str_contains($name, 'germania')) {
            return 'Europa';
        }
        if (str_contains($name, 'gaza') || str_contains($name, 'israele') || str_contains($name, 'israel') || str_contains($name, 'libano') || str_contains($name, 'lebanon') || str_contains($name, 'yemen') || str_contains($name, 'rosso') || str_contains($name, 'red sea') || str_contains($name, 'iran') || str_contains($name, 'siria') || str_contains($name, 'syria') || str_contains($name, 'iraq') || str_contains($name, 'arabia') || str_contains($name, 'saudi') || str_contains($name, 'egitto') || str_contains($name, 'egypt') || str_contains($name, 'medio oriente') || str_contains($name, 'middle east')) {
            return 'Medio Oriente';
        }
        if (str_contains($name, 'taiwan') || str_contains($name, 'cinese') || str_contains($name, 'cina') || str_contains($name, 'china') || str_contains($name, 'giappone') || str_contains($name, 'japan') || str_contains($name, 'corea') || str_contains($name, 'korea') || str_contains($name, 'indo') || str_contains($name, 'pacific') || str_contains($name, 'india') || str_contains($name, 'pakistan') || str_contains($name, 'afghanistan') || str_contains($name, 'asia')) {
            return 'Asia-Pacifico';
        }
        if (str_contains($name, 'sahel') || str_contains($name, 'sudan') || str_contains($name, 'etiopia') || str_contains($name, 'ethiopia') || str_contains($name, 'nigeria') || str_contains($name, 'africa') || str_contains($name, 'libia') || str_contains($name, 'libya') || str_contains($name, 'algeria')) {
            return 'Africa';
        }
        if (str_contains($name, 'stati uniti') || str_contains($name, 'united states') || str_contains($name, 'usa') || str_contains($name, 'washington') || str_contains($name, 'venezuela') || str_contains($name, 'cuba') || str_contains($name, 'messico') || str_contains($name, 'mexico') || str_contains($name, 'brasile') || str_contains($name, 'brazil') || str_contains($name, 'argentina') || str_contains($name, 'america')) {
            return 'Americhe';
        }

        // 2. Classificazione di fallback tramite coordinate geografiche (se il nome non combacia)
        if ($lat !== null && $lng !== null) {
            if ($lng >= -170 && $lng <= -30) {
                return 'Americhe';
            }
            if ($lat >= -35 && $lat <= 37 && $lng >= -20 && $lng <= 52) {
                return 'Africa';
            }
            if ($lat >= 36 && $lat <= 72 && $lng >= -10 && $lng <= 40) {
                return 'Europa';
            }
            if ($lat >= 10 && $lat <= 45 && $lng >= 33 && $lng <= 60) {
                return 'Medio Oriente';
            }
            if ($lng >= 60 && $lng <= 180) {
                return 'Asia-Pacifico';
            }
        }

        return 'Europa';
    }
}