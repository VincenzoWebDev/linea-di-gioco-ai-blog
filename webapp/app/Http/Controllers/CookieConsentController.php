<?php

namespace App\Http\Controllers;

use App\Models\CookieConsent;
use Illuminate\Http\Request;

class CookieConsentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'anon_id' => 'nullable|string',
            'necessary' => 'required|boolean',
            'analytics' => 'boolean',
            'marketing' => 'boolean',
        ]);
        CookieConsent::create([
            'anon_id' => $data['anon_id'] ?? null,
            'ip' => $request->ip(),
            'necessary' => true,
            'analytics' => $data['analytics'] ?? false,
            'marketing' => $data['marketing'] ?? false,
            'meta' => [
                'user_agent' => $request->userAgent(),
            ],
            'policy_version' => 'v1.0',
        ]);

        return response()->json(['status' => 'ok']);
    }
}
