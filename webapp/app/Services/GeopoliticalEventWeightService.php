<?php

namespace App\Services;

class GeopoliticalEventWeightService
{
    /** @var list<string> */
    private const DECOMPRESSION_SIGNALS = [
        'accordo di pace',
        'cessate il fuoco',
        'tregua',
        'de-escalation',
        'distensione',
        'negoziato riuscito',
        'revoca delle sanzioni',
        'ritiro delle truppe',
        'riapertura diplomatica',
    ];

    /**
     * Translate the AI risk estimate into an event pressure delta.
     */
    public function delta(int $calibratedRiskScore, string $trendDirection, string $context, string $statusLabel = ''): int
    {
        $weight = $this->baseWeight($calibratedRiskScore);
        $text = mb_strtolower(trim($context.' '.$statusLabel));
        $trendDirection = strtolower(trim($trendDirection));

        if ($trendDirection === 'falling' || $this->hasDecompressionSignal($text)) {
            return -$weight;
        }

        return $weight;
    }

    private function baseWeight(int $score): int
    {
        $score = max(0, min(100, $score));

        return match (true) {
            $score >= 85 => 50,
            $score >= 70 => 40,
            $score >= 55 => 30,
            $score >= 40 => 20,
            $score >= 25 => 10,
            default => 5,
        };
    }

    private function hasDecompressionSignal(string $text): bool
    {
        foreach (self::DECOMPRESSION_SIGNALS as $signal) {
            if (str_contains($text, $signal)) {
                return true;
            }
        }

        return false;
    }
}
