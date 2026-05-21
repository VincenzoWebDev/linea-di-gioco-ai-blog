<?php

namespace App\Support;

use Carbon\CarbonInterface;

class ThermalDecay
{
    /**
     * @return array{
     *     initial_risk_score: int,
     *     current_tension: int,
     *     silence_hours: int,
     *     decay_days: int,
     *     radio_silence_label: string
     * }
     */
    public static function snapshot(int $initialRiskScore, ?CarbonInterface $updatedAt, ?CarbonInterface $now = null): array
    {
        $now ??= now();

        $initial = max(0, min(100, $initialRiskScore));
        $silenceHours = $updatedAt ? max(0, $updatedAt->diffInHours($now)) : 0;
        $graceHours = max(0, (int) config('ai_news.thermal_decay.grace_hours', 24));
        $penaltyPerDay = max(1, (int) config('ai_news.thermal_decay.penalty_per_day', 15));
        $decayDays = $silenceHours <= $graceHours
            ? 0
            : (int) ceil(($silenceHours - $graceHours) / 24);
        $currentTension = max(0, $initial - ($decayDays * $penaltyPerDay));

        return [
            'initial_risk_score' => $initial,
            'current_tension' => $currentTension,
            'silence_hours' => $silenceHours,
            'decay_days' => $decayDays,
            'radio_silence_label' => self::radioSilenceLabel($silenceHours),
        ];
    }

    public static function radioSilenceLabel(int $hours): string
    {
        $hours = max(0, $hours);

        if ($hours < 24) {
            return sprintf(
                'Silenzio radio: %d %s',
                $hours,
                $hours === 1 ? 'ora' : 'ore'
            );
        }

        $days = intdiv($hours, 24);
        $remainingHours = $hours % 24;
        $label = sprintf(
            'Silenzio radio: %d %s',
            $days,
            $days === 1 ? 'giorno' : 'giorni'
        );

        if ($remainingHours > 0) {
            $label .= sprintf(
                ' e %d %s',
                $remainingHours,
                $remainingHours === 1 ? 'ora' : 'ore'
            );
        }

        return $label;
    }
}
