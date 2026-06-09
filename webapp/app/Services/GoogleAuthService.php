<?php

namespace App\Services;

use Google\Auth\ApplicationDefaultCredentials;
use RuntimeException;

class GoogleAuthService
{
    public function getAccessToken(): string
    {
        $credentialsPath = trim((string) config('services.google.credentials'));

        if ($credentialsPath === '') {
            throw new RuntimeException('missing_google_credentials_path');
        }

        if (! is_file($credentialsPath) || ! is_readable($credentialsPath)) {
            throw new RuntimeException('invalid_google_credentials_file');
        }

        putenv('GOOGLE_APPLICATION_CREDENTIALS='.$credentialsPath);

        $scopes = [
            'https://www.googleapis.com/auth/cloud-platform',
        ];

        $credentials = ApplicationDefaultCredentials::getCredentials($scopes);

        $token = $credentials->fetchAuthToken();

        $accessToken = is_array($token)
            ? ($token['access_token'] ?? null)
            : null;

        if (! is_string($accessToken) || $accessToken === '') {
            throw new RuntimeException('missing_google_access_token');
        }

        return $accessToken;
    }
}
