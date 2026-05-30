<?php

namespace App\Services;

class RiskScoreCalibrationService
{
    /** @var list<string> */
    private const HIGH_SIGNALS = [
        'guerra',
        'invasione',
        'invaso',
        'bombardamento',
        'bombardamenti',
        'raid aereo',
        'missile',
        'missili',
        'mobilitazione militare',
        'mobilitazione di truppe',
        'casualt',
        'vittime',
        'massacro',
        'genocidio',
        'armi nucleari',
        'nucleare',
        'attacco militare',
        'offensiva militare',
        'caduti',
        'uccisi in combattimento',
        'base usa',
        'base statunitense',
        'base americana',
        'forze statunitensi',
        'us base',
        'american base',
        'missile strike',
        'air strike',
    ];

    /** @var list<string> */
    private const MEDIUM_SIGNALS = [
        'sanzioni',
        'embargo',
        'blocco navale',
        'escalation',
        'truppe',
        'dispiegamento',
        'drone',
        'artiglieria',
        'raid',
        'cessate il fuoco violato',
        'violazione del cessate il fuoco',
        'rottura diplomatica',
        'espulsione ambasciator',
        'intercett',
        'minaccia',
        'offensiva',
        'conflitto',
        'fronte',
        'deterrenza',
        'ultimatum',
        'annessione',
        'base militare',
        'military base',
        'retaliation',
        'ritorsione',
    ];

    /** @var list<string> */
    private const ROUTINE_SIGNALS = [
        'vertice',
        'summit',
        'incontro bilaterale',
        'talks',
        'trattativa',
        'accordo commerciale',
        'nomina',
        'elezioni locali',
        'dichiarazione congiunta',
        'comunicato stampa',
        'monitoraggio',
        'relazione annuale',
    ];

    /** @var list<string> */
    private const SPECULATIVE_SIGNALS = [
        'potrebbe',
        'rischia di',
        'temuto',
        'timori',
        'scenario',
        'ipotesi',
        'secondo fonti',
        'non confermato',
        'voci di corridoio',
        'specul',
    ];

    /** @var list<string> */
    private const GENERAL_GEO_SIGNALS = [
        'sicurezza',
        'difesa',
        'confine',
        'confini',
        'militare',
        'diplomatic',
        'negoziati',
        'colloqui',
        'ceasefire',
        'cessate il fuoco',
        'sanzioni',
        'embargo',
        'nato',
        'onu',
        'missile',
        'drone',
        'truppe',
        'raid',
        'deterrenza',
        'conflitto',
        'base usa',
        'base statunitense',
        'forze statunitensi',
        'us base',
    ];

    public function calibrate(int $rawScore, string $context, string $statusLabel = '', string $trendDirection = 'stable'): int
    {
        $text = mb_strtolower(trim($context . ' ' . $statusLabel));
        $score = max(1, min(100, $rawScore));
        $trendDirection = strtolower(trim($trendDirection));

        $highCount = $this->countSignals($text, self::HIGH_SIGNALS);
        $mediumCount = $this->countSignals($text, self::MEDIUM_SIGNALS);
        $hasRoutineSignals = $this->hasAny($text, self::ROUTINE_SIGNALS);
        $hasSpeculativeSignals = $this->hasAny($text, self::SPECULATIVE_SIGNALS);
        $generalGeoCount = $this->countSignals($text, self::GENERAL_GEO_SIGNALS);
        $signalDensity = ($highCount * 3) + ($mediumCount * 2) + min($generalGeoCount, 4);

        if ($score >= 70) {
            if ($highCount === 0 && $mediumCount === 0) {
                $score = min($score, 52);
            } elseif ($highCount === 0 && $mediumCount <= 1) {
                $score = min($score, 58);
            } elseif ($highCount === 0 && $score >= 80) {
                $score = min($score, 65);
            }
        }

        if ($score >= 55 && $hasRoutineSignals && $highCount === 0) {
            $score = min($score, 48);
        }

        if ($score >= 60 && $hasSpeculativeSignals && $highCount === 0) {
            $score = min($score, 52);
        }

        if ($score < 35 && $highCount >= 2) {
            $score = max($score, 45);
        }

        if ($score <= 5) {
            if ($highCount >= 2) {
                $score = max(
                    $score,
                    min(78, 58 + max(0, $highCount - 2) * 4 + min($mediumCount, 3) * 2)
                );
            } elseif ($highCount >= 1 && $mediumCount >= 1) {
                $score = max(
                    $score,
                    min(68, 52 + min($mediumCount, 3) * 3 + min($generalGeoCount, 3))
                );
            } elseif ($highCount >= 1) {
                $score = max(
                    $score,
                    min(58, 44 + min($mediumCount, 2) * 4 + min($generalGeoCount, 3))
                );
            } elseif ($mediumCount >= 2) {
                $score = max(
                    $score,
                    min(48, 28 + ($mediumCount * 4) + min($generalGeoCount, 4))
                );
            } elseif ($mediumCount >= 1) {
                $score = max(
                    $score,
                    min(34, 22 + min($generalGeoCount, 4) * 2)
                );
            } elseif ($generalGeoCount >= 2 && ! $hasRoutineSignals) {
                $score = max(
                    $score,
                    min(26, 18 + min($generalGeoCount, 4) * 2)
                );
            }
        } elseif ($score < 20) {
            if ($highCount >= 1) {
                $score = max($score, 35);
            } elseif ($mediumCount >= 2) {
                $score = max($score, 38);
            } elseif ($mediumCount >= 1 && ! $hasRoutineSignals) {
                $score = max($score, 26);
            }
        }

        if ($score <= 55 && $signalDensity >= 4) {
            $score += min(8, max(0, $signalDensity - 3) * 2);
        }

        if ($trendDirection === 'rising' && $signalDensity >= 3 && ! $hasRoutineSignals) {
            $score += min(6, $highCount * 2 + max(0, $mediumCount - 1));
        }

        if ($trendDirection === 'falling' && $score >= 45 && $highCount === 0) {
            $score -= min(4, 1 + (int) $hasSpeculativeSignals);
        }

        return max(1, min(100, $score));
    }

    /**
     * @param list<string> $signals
     */
    private function countSignals(string $text, array $signals): int
    {
        $count = 0;

        foreach ($signals as $signal) {
            if (str_contains($text, $signal)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @param list<string> $signals
     */
    private function hasAny(string $text, array $signals): bool
    {
        foreach ($signals as $signal) {
            if (str_contains($text, $signal)) {
                return true;
            }
        }

        return false;
    }
}
