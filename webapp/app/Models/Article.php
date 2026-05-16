<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'cover_path',
        'thumb_path',
        'source_url',
        'source_name',
        'ai_generated',
        'quality_score',
        'glossary',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'ai_generated' => 'boolean',
        'quality_score' => 'decimal:2',
        'glossary' => 'array',
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
}
