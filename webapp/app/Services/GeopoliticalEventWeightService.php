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

    /** @var list<string> */
    private const ESCALATION_SIGNALS = [
        'attacco militare',
        'attacco missilistico',
        'attacco aereo',
        'bombardamento',
        'bombardamenti',
        'offensiva militare',
        'invasione',
        'incursione armata',
        'raid aereo',
        'missile',
        'missili',
        'strike on',
        'military strike',
        'air strike',
        'drone strike',
        'base usa',
        'base statunitense',
        'base americana',
        'base militare',
        'forze statunitensi',
        'us base',
        'american base',
        'military base',
    ];

    /**
     * Translate the AI risk estimate into an event pressure delta.
     */
    public function delta(int $calibratedRiskScore, string $trendDirection, string $context, string $statusLabel = ''): int
    {
        $weight = $this->baseWeight($calibratedRiskScore);
        $text = mb_strtolower(trim($context . ' ' . $statusLabel));
        $statusText = mb_strtolower(trim($statusLabel));
        $trendDirection = strtolower(trim($trendDirection));
        $hasEscalationSignal = $this->hasEscalationSignal($text);
        $hasDecompressionSignal = $this->hasDecompressionSignal($text);
        if ($hasEscalationSignal && $this->hasStrategicBaseAttackSignal($text)) {
            $weight = max($weight, 40);
        }

        if ($hasDecompressionSignal && ! $this->hasEscalationSignal($statusText)) {
            return -$weight;
        }

        if ($trendDirection === 'falling' && ! $hasEscalationSignal) {
            return -$weight;
        }

        return $weight;
    }

    private function baseWeight(int $score): int
    {
        $score = max(0, min(100, $score));

        return match (true) {
            $score >= 85 => 15,
            $score >= 70 => 10,
            $score >= 55 => 7,
            $score >= 40 => 5,
            $score >= 25 => 3,
            default => 1,
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

    private function hasEscalationSignal(string $text): bool
    {
        foreach (self::ESCALATION_SIGNALS as $signal) {
            if (str_contains($text, $signal)) {
                return true;
            }
        }

        return false;
    }

    private function hasStrategicBaseAttackSignal(string $text): bool
    {
        $mentionsBaseOrForces = str_contains($text, 'base usa')
            || str_contains($text, 'base statunitense')
            || str_contains($text, 'base americana')
            || str_contains($text, 'forze statunitensi')
            || str_contains($text, 'us base')
            || str_contains($text, 'american base');

        if (! $mentionsBaseOrForces) {
            return false;
        }

        return str_contains($text, 'missile')
            || str_contains($text, 'missili')
            || str_contains($text, 'attacco missilistico')
            || str_contains($text, 'attacco militare')
            || str_contains($text, 'raid aereo')
            || str_contains($text, 'air strike')
            || str_contains($text, 'military strike')
            || str_contains($text, 'drone strike')
            || str_contains($text, 'bombardamento');
    }
}
