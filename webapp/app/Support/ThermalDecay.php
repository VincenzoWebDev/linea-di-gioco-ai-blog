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
     *     decay_model: string,
     *     decay_percent_per_day: float,
     *     radio_silence_label: string
     * }
     */
    public static function snapshot(
        int $initialRiskScore,
        ?CarbonInterface $lastEventAt,
        ?CarbonInterface $now = null,
        ?CarbonInterface $lastDecayAt = null
    ): array
    {
        $now ??= now();

        $initial = max(0, min(100, $initialRiskScore));
        $rawSilenceHours = $lastEventAt ? max(0, $lastEventAt->diffInHours($now)) : 0;
        $maxSilenceHours = max(1, (int) config('ai_news.thermal_decay.max_silence_hours', 168));
        $silenceHours = min($rawSilenceHours, $maxSilenceHours);
        $graceHours = max(0, (int) config('ai_news.thermal_decay.grace_hours', 24));
        $model = (string) config('ai_news.thermal_decay.model', 'exponential');
        $decayPercentPerDay = max(0.0, min(95.0, (float) config('ai_news.thermal_decay.decay_percent_per_day', 10)));
        $referenceAt = $lastEventAt;

        if ($lastEventAt && $lastDecayAt && $lastDecayAt->greaterThan($lastEventAt)) {
            $referenceAt = $lastDecayAt;
        }

        $decayStartAt = $lastEventAt?->copy()->addHours($graceHours);
        if ($decayStartAt && $referenceAt && $referenceAt->lessThan($decayStartAt)) {
            $referenceAt = $decayStartAt;
        }

        $decayHours = $referenceAt && $referenceAt->lessThan($now)
            ? max(0, $referenceAt->diffInHours($now))
            : 0;
        $decayDays = $decayHours <= 0 ? 0 : (int) ceil($decayHours / 24);
        $currentTension = match ($model) {
            'linear' => max(0, $initial - ($decayDays * max(1, (int) config('ai_news.thermal_decay.penalty_per_day', 15)))),
            default => self::exponentialTension($initial, $decayHours, $decayPercentPerDay),
        };

        return [
            'initial_risk_score' => $initial,
            'current_tension' => $currentTension,
            'silence_hours' => $silenceHours,
            'decay_days' => $decayDays,
            'decay_model' => $model,
            'decay_percent_per_day' => $decayPercentPerDay,
            'radio_silence_label' => self::radioSilenceLabel($silenceHours),
        ];
    }

    private static function exponentialTension(int $initial, int $decayHours, float $decayPercentPerDay): int
    {
        if ($initial <= 0 || $decayHours <= 0 || $decayPercentPerDay <= 0.0) {
            return $initial;
        }

        $dailyRetention = 1 - ($decayPercentPerDay / 100);
        $days = $decayHours / 24;

        return max(0, (int) round($initial * ($dailyRetention ** $days)));
    }

    public static function radioSilenceLabel(int $hours): string
    {
        $hours = max(0, $hours);
        $maxSilenceHours = max(1, (int) config('ai_news.thermal_decay.max_silence_hours', 168));

        if ($hours >= $maxSilenceHours) {
            return 'Silenzio radio: 1 settimana';
        }

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
