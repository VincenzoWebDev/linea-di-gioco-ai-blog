<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class IncomingNews extends Model
{
    protected $fillable = [
        'news_source_id',
        'external_id',
        'url',
        'title',
        'summary',
        'source_content',
        'raw_payload',
        'sanitized_payload',
        'fingerprint',
        'published_at',
        'extracted_at',
        'sanitized_at',
        'status',
        'quality_score',
        'rejection_reason',
    ];

    protected $casts = [
        'raw_payload' => 'array',
        'sanitized_payload' => 'array',
        'published_at' => 'datetime',
        'extracted_at' => 'datetime',
        'sanitized_at' => 'datetime',
        'quality_score' => 'decimal:2',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(NewsSource::class, 'news_source_id');
    }

    public function agentRuns(): HasMany
    {
        return $this->hasMany(AgentRun::class);
    }

    public function article(): HasOne
    {
        return $this->hasOne(Article::class);
    }
}
