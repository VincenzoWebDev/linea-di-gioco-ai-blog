<?php

namespace Tests\Unit;

use App\Services\ArticleValidationService;
use Tests\TestCase;

class ArticleValidationServiceTest extends TestCase
{
    public function test_rejects_sports_content(): void
    {
        config()->set('ai_news.min_quality_score', 70);

        $service = new ArticleValidationService();

        $result = $service->validateSanitizedPayload([
            'title' => 'Il match di Champions League cambia il calendario europeo',
            'summary' => 'Analisi della semifinale e del mercato estivo.',
            'content' => 'La partita di calcio tra due club europei domina il dibattito, tra goal, allenatori e trasferimenti. Fonte: https://example.com/sport',
            'topic' => 'calcio',
            'categories' => ['sport'],
            'quality_score' => 90,
            'source_url' => 'https://example.com/sport',
            'language' => 'it',
        ]);

        $this->assertFalse($result['valid']);
        $this->assertContains('Contenuto fuori scope editoriale', $result['errors']);
    }

    public function test_rejects_non_italian_content(): void
    {
        config()->set('ai_news.min_quality_score', 70);

        $service = new ArticleValidationService();

        $result = $service->validateSanitizedPayload([
            'title' => 'Diplomatic tensions rise after the summit',
            'summary' => 'Officials said the agreement could change the regional balance.',
            'content' => 'The government said the talks with allied officials would continue after the summit, with new sanctions under review. Fonte: https://example.com/world',
            'topic' => 'geopolitics',
            'categories' => ['foreign policy'],
            'quality_score' => 90,
            'source_url' => 'https://example.com/world',
            'language' => 'en',
        ]);

        $this->assertFalse($result['valid']);
        $this->assertContains('Contenuto non sufficientemente in italiano', $result['errors']);
    }

    public function test_accepts_in_scope_italian_geopolitics_content(): void
    {
        config()->set('ai_news.min_quality_score', 70);

        $service = new ArticleValidationService();

        $result = $service->validateSanitizedPayload([
            'title' => 'L\'Unione europea valuta nuove sanzioni energetiche',
            'summary' => 'Il vertice dei ministri degli Esteri punta a rafforzare la sicurezza comune.',
            'content' => 'Il governo italiano segue con attenzione il negoziato europeo sulle forniture di gas, mentre i ministri discutono nuove sanzioni e misure di sicurezza per contenere il conflitto. Fonte: https://example.com/geopolitica',
            'topic' => 'geopolitica',
            'categories' => ['diplomazia', 'energia'],
            'quality_score' => 88,
            'source_url' => 'https://example.com/geopolitica',
            'language' => 'it',
        ]);

        $this->assertTrue($result['valid']);
        $this->assertSame([], $result['errors']);
    }
}
