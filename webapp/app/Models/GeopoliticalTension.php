<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeopoliticalTension extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'region_name',
        'latitude',
        'longitude',
        'risk_score',
        'trend_direction',
        'status_label',
        'featured_article_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'risk_score' => 'integer',
    ];

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
