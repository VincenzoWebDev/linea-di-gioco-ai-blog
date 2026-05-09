<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsSource extends Model
{
    protected $fillable = [
        'name',
        'type',
        'endpoint',
        'is_active',
        'poll_interval_minutes',
        'meta',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'meta' => 'array',
    ];

    public function incomingNews(): HasMany
    {
        return $this->hasMany(IncomingNews::class);
    }
}

