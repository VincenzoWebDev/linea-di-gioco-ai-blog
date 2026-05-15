<?php

namespace App\Services\News;

use App\Enums\IncomingNewsStatus;
use App\Models\IncomingNews;
use InvalidArgumentException;

class IncomingNewsStateMachine
{
    /** @var array<string, list<string>> */
    private const TRANSITIONS = [
        IncomingNewsStatus::RAW => [
            IncomingNewsStatus::QUEUED,
            IncomingNewsStatus::REJECTED,
        ],
        IncomingNewsStatus::QUEUED => [
            IncomingNewsStatus::EXTRACTED,
            IncomingNewsStatus::SANITIZED,
            IncomingNewsStatus::REJECTED,
        ],
        IncomingNewsStatus::EXTRACTED => [
            IncomingNewsStatus::SANITIZED,
            IncomingNewsStatus::REJECTED,
        ],
        IncomingNewsStatus::SANITIZED => [
            IncomingNewsStatus::VALIDATED,
            IncomingNewsStatus::REJECTED,
        ],
        IncomingNewsStatus::VALIDATED => [
            IncomingNewsStatus::PUBLISHED,
            IncomingNewsStatus::REJECTED,
        ],
    ];

    public function canTransition(string $from, string $to): bool
    {
        if ($to === IncomingNewsStatus::REJECTED) {
            return ! in_array($from, [IncomingNewsStatus::REJECTED, IncomingNewsStatus::PUBLISHED], true);
        }

        return in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function transition(IncomingNews $incoming, string $toStatus, array $attributes = []): IncomingNews
    {
        $fromStatus = (string) $incoming->status;

        if (! $this->canTransition($fromStatus, $toStatus)) {
            throw new InvalidArgumentException(
                "Transizione non consentita: {$fromStatus} → {$toStatus} (incoming #{$incoming->id})"
            );
        }

        $incoming->update([
            'status' => $toStatus,
            ...$attributes,
        ]);

        return $incoming->refresh();
    }

    public function reject(IncomingNews $incoming, string $reason): IncomingNews
    {
        return $this->transition($incoming, IncomingNewsStatus::REJECTED, [
            'rejection_reason' => $reason,
        ]);
    }
}
