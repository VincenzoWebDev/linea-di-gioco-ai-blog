<?php

namespace Tests\Unit;

use App\Services\ArticleInsightService;
use Tests\TestCase;

class ArticleInsightServiceTest extends TestCase
{
    public function test_it_completes_summary_with_terminal_punctuation(): void
    {
        $service = app(ArticleInsightService::class);

        $summary = $service->normalizeSummary(
            'La pressione diplomatica cresce tra i due governi',
            '',
            'Titolo di prova'
        );

        $this->assertSame(
            'La pressione diplomatica cresce tra i due governi.',
            $summary
        );
    }

    public function test_it_recovers_a_complete_sentence_from_content_when_summary_is_weak(): void
    {
        $service = app(ArticleInsightService::class);

        $summary = $service->normalizeSummary(
            'Bozza',
            'Le delegazioni hanno riaperto il canale tecnico sul confine. Le parti attendono un nuovo passaggio politico.',
            'Titolo di prova'
        );

        $this->assertSame(
            'Le delegazioni hanno riaperto il canale tecnico sul confine.',
            $summary
        );
    }
}
