<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentRun extends Model
{
    protected $fillable = [
        'incoming_news_id',
        'agent_name',
        'prompt_version',
        'status',
        'result_payload',
        'error_message',
    ];

    protected $casts = [
        'result_payload' => 'array',
    ];

    public function incomingNews(): BelongsTo
    {
        return $this->belongsTo(IncomingNews::class);
    }
}

