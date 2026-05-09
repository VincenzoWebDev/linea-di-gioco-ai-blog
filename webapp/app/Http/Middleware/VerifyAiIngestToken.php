<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyAiIngestToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('ai_news.ingest.token', '');
        if ($expected === '') {
            return response()->json([
                'accepted' => false,
                'error' => 'ingest_token_not_configured',
            ], 500);
        }

        $provided = (string) $request->bearerToken();
        if ($provided === '' || ! hash_equals($expected, $provided)) {
            return response()->json([
                'accepted' => false,
                'error' => 'unauthorized',
            ], 401);
        }

        return $next($request);
    }
}

