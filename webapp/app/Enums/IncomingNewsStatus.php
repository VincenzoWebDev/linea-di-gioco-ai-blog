<?php

namespace App\Enums;

final class IncomingNewsStatus
{
    public const RAW = 'raw';
    public const QUEUED = 'queued';
    public const EXTRACTED = 'extracted';
    public const SANITIZED = 'sanitized';
    public const VALIDATED = 'validated';
    public const PUBLISHED = 'published';
    public const REJECTED = 'rejected';

    public static function values(): array
    {
        return [
            self::RAW,
            self::QUEUED,
            self::EXTRACTED,
            self::SANITIZED,
            self::VALIDATED,
            self::PUBLISHED,
            self::REJECTED,
        ];
    }
}
