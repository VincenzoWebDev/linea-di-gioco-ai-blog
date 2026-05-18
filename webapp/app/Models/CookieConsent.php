<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CookieConsent extends Model
{
    use HasFactory;

    protected $fillable = [
        'anon_id',
        'ip',
        'necessary',
        'analytics',
        'marketing',
        'meta',
        'policy_version',
    ];

    protected $casts = [
        'necessary' => 'boolean',
        'analytics' => 'boolean',
        'marketing' => 'boolean',
        'meta' => 'array',
    ];
}
