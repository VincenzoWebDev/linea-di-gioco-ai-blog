<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'incoming_news_id',
        'title',
        'slug',
        'summary',
        'content',
        'status',
        'publication_status',
        'created_by',
        'published_at',
        'workflow_session_key',
        'workflow_triggered_at',
        'workflow_trigger_hour',
        'workflow_session_ai_quota',
        'workflow_session_rank',
        'image_generation_mode',
        'ai_image_generated_at',
        'cover_path',
        'thumb_path',
        'source_url',
        'source_name',
        'ai_generated',
        'quality_score',
        'glossary',
        'future_scenarios',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'workflow_triggered_at' => 'datetime',
        'ai_image_generated_at' => 'datetime',
        'ai_generated' => 'boolean',
        'quality_score' => 'decimal:2',
        'glossary' => 'array',
        'future_scenarios' => 'array',
    ];

    public function incomingNews(): BelongsTo
    {
        return $this->belongsTo(IncomingNews::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'article_category')
            ->withTimestamps();
    }

    public function tension(): HasOne
    {
        return $this->hasOne(GeopoliticalTension::class, 'featured_article_id');
    }
}
