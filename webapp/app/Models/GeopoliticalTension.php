<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeopoliticalTension extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'region_name',
        'risk_score',
        'trend_direction',
        'status_label',
        'featured_article_id',
    ];

    protected $casts = [
        'risk_score' => 'integer',
    ];

    public function featuredArticle(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'featured_article_id');
    }

    public function getStatusColor(): string
    {
        return match (true) {
            $this->risk_score >= 75 => 'text-red-600',
            $this->risk_score >= 50 => 'text-orange-600',
            $this->risk_score >= 25 => 'text-yellow-600',
            default => 'text-green-600',
        };
    }
}
