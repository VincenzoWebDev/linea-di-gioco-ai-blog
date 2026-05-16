<?php

namespace App\Support;

class GeopoliticalSeverity
{
    public static function fromRiskScore(int $score): string
    {
        return match (true) {
            $score >= (int) config('ai_news.risk.severity_high', 80) => 'high',
            $score >= (int) config('ai_news.risk.severity_elevated', 60) => 'elevated',
            $score >= (int) config('ai_news.risk.severity_guarded', 40) => 'guarded',
            default => 'low',
        };
    }
}
