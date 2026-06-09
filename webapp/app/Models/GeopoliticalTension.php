<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeopoliticalTension extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'region_name',
        'display_region_name',
        'region_key',
        'latitude',
        'longitude',
        'risk_score',
        'trend_direction',
        'status_label',
        'featured_article_id',
        'last_event_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'risk_score' => 'integer',
        'last_event_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        $ttlHours = (int) config('ai_news.tensions.ttl_hours', 48);
        $minActiveRiskScore = (int) config('ai_news.tensions.min_active_risk_score', 30);
        $threshold = now()->subHours($ttlHours);

        return $query->where('risk_score', '>=', $minActiveRiskScore)
            ->where(function ($q) use ($threshold) {
                $q->where(function ($sq) use ($threshold) {
                    $sq->whereNotNull('last_event_at')
                        ->where('last_event_at', '>', $threshold);
                })->orWhere(function ($sq) use ($threshold) {
                    $sq->whereNull('last_event_at')
                        ->where('updated_at', '>', $threshold);
                });
            });
    }

    public function hasMapCoordinates(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    public function featuredArticle(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'featured_article_id');
    }

    public function getStatusColor(): string
    {
        return match (true) {
            $this->risk_score >= (int) config('ai_news.risk.severity_high', 80) => 'text-red-600',
            $this->risk_score >= (int) config('ai_news.risk.severity_elevated', 60) => 'text-orange-600',
            $this->risk_score >= (int) config('ai_news.risk.severity_guarded', 40) => 'text-yellow-600',
            default => 'text-green-600',
        };
    }
}
