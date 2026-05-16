<?php

namespace App\Services;

class RiskScoreCalibrationService
{
    /** @var list<string> */
    private const HIGH_SIGNALS = [
        'guerra', 'invasione', 'invaso', 'bombardamento', 'bombardamenti', 'raid aereo',
        'missile', 'missili', 'mobilitazione militare', 'mobilitazione di truppe',
        'casualt', 'vittime', 'massacro', 'genocidio', 'armi nucleari', 'nucleare',
        'attacco militare', 'offensiva militare', 'caduti', 'uccisi in combattimento',
    ];

    /** @var list<string> */
    private const MEDIUM_SIGNALS = [
        'sanzioni', 'embargo', 'blocco navale', 'escalation',
        'truppe', 'dispiegamento', 'drone', 'artiglieria', 'raid',
        'cessate il fuoco violato', 'rottura diplomatica', 'espulsione ambasciator',
    ];

    /** @var list<string> */
    private const ROUTINE_SIGNALS = [
        'vertice', 'summit', 'incontro bilaterale', 'talks', 'trattativa',
        'accordo commerciale', 'nomina', 'elezioni locali', 'dichiarazione congiunta',
        'comunicato stampa', 'monitoraggio', 'relazione annuale',
    ];

    /** @var list<string> */
    private const SPECULATIVE_SIGNALS = [
        'potrebbe', 'rischia di', 'temuto', 'timori', 'scenario', 'ipotesi',
        'secondo fonti', 'non confermato', 'voci di corridoio', 'specul',
    ];

    public function calibrate(int $rawScore, string $context, string $statusLabel = ''): int
    {
        $text = mb_strtolower(trim($context . ' ' . $statusLabel));
        $score = max(1, min(100, $rawScore));

        $highCount = $this->countSignals($text, self::HIGH_SIGNALS);
        $mediumCount = $this->countSignals($text, self::MEDIUM_SIGNALS);

        if ($score >= 70) {
            if ($highCount === 0 && $mediumCount === 0) {
                $score = min($score, 52);
            } elseif ($highCount === 0 && $mediumCount <= 1) {
                $score = min($score, 58);
            } elseif ($highCount === 0 && $score >= 80) {
                $score = min($score, 65);
            }
        }

        if ($score >= 55 && $this->hasAny($text, self::ROUTINE_SIGNALS) && $highCount === 0) {
            $score = min($score, 48);
        }

        if ($score >= 60 && $this->hasAny($text, self::SPECULATIVE_SIGNALS) && $highCount === 0) {
            $score = min($score, 52);
        }

        if ($score < 35 && $highCount >= 2) {
            $score = max($score, 55);
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
