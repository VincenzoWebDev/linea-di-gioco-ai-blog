<?php

namespace App\Enums;

final class ArticlePublicationStatus
{
    public const DRAFT = 'draft';
    public const PENDING_REVIEW = 'pending_review';
    public const PUBLISHED = 'published';
    public const REJECTED = 'rejected';

    public static function values(): array
    {
        return [
            self::DRAFT,
            self::PENDING_REVIEW,
            self::PUBLISHED,
            self::REJECTED,
        ];
    }
}

