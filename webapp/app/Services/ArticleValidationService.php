<?php

namespace App\Services;

use Illuminate\Support\Str;

class ArticleValidationService
{
    /**
     * @param array<string, mixed> $payload
     * @return array{valid: bool, errors: array<int, string>}
     */
    public function validateSanitizedPayload(array $payload): array
    {
        $errors = [];

        if (empty($payload['title'])) {
            $errors[] = 'Titolo mancante';
        }

        if (empty($payload['content']) || mb_strlen((string) $payload['content']) < 40) {
            $errors[] = 'Contenuto troppo corto';
        }

        $minScore = (float) config('ai_news.min_quality_score', 70);
        if ((float) ($payload['quality_score'] ?? 0) < $minScore) {
            $errors[] = 'Quality score sotto soglia';
        }

        foreach ($this->validateContentPolicy($payload)['errors'] as $error) {
            $errors[] = $error;
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * @param array<string, mixed> $payload
     * @return array{valid: bool, errors: array<int, string>}
     */
    public function validateContentPolicy(array $payload): array
    {
        $errors = [];
        $combinedText = $this->combinedText($payload);

        if ($combinedText === '') {
            $errors[] = 'Contenuto non analizzabile';
        } else {
            if ($this->containsBlockedTopic($combinedText)) {
                $errors[] = 'Contenuto fuori scope editoriale';
            }

            if (! $this->containsAllowedTopic($combinedText)) {
                $errors[] = 'Contenuto non coerente con la linea geopolitica del blog';
            }

        }

        return [
            'valid' => $errors === [],
            'errors' => $errors,
        ];
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function needsItalianRewrite(array $payload): bool
    {
        $combinedText = $this->combinedText($payload);

        return $combinedText !== ''
            && ! $this->looksItalian($combinedText, (string) ($payload['language'] ?? ''));
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function combinedText(array $payload): string
    {
        $categories = collect((array) ($payload['categories'] ?? []))
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->implode(' ');

        $parts = [
            trim((string) ($payload['title'] ?? '')),
            trim((string) ($payload['summary'] ?? '')),
            trim((string) ($payload['content'] ?? '')),
            trim((string) ($payload['topic'] ?? '')),
            $categories,
        ];

        return Str::of(implode("\n", array_filter($parts)))
            ->lower()
            ->replaceMatches('/https?:\/\/\S+/u', ' ')
            ->replaceMatches('/[^\pL\pN\s]/u', ' ')
            ->replaceMatches('/\s+/u', ' ')
            ->trim()
            ->toString();
    }

    private function containsBlockedTopic(string $text): bool
    {
        foreach ((array) config('ai_news.scope.block_keywords', []) as $keyword) {
            if ($this->containsKeyword($text, (string) $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function containsAllowedTopic(string $text): bool
    {
        foreach ((array) config('ai_news.scope.allow_keywords', []) as $keyword) {
            if ($this->containsKeyword($text, (string) $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function containsKeyword(string $text, string $keyword): bool
    {
        $normalized = trim(Str::lower($keyword));
        if ($normalized === '') {
            return false;
        }

        $pattern = '/(?<!\pL)'.preg_replace('/\s+/u', '\s+', preg_quote($normalized, '/')).'(?!\pL)/u';

        return is_string($pattern) && preg_match($pattern, $text) === 1;
    }

    private function looksItalian(string $text, string $_language): bool
    {
        $italianMarkers = [
            ' il ', ' lo ', ' la ', ' gli ', ' le ', ' un ', ' una ', ' che ', ' con ', ' per ',
            ' della ', ' delle ', ' degli ', ' nello ', ' nella ', ' mentre ', ' secondo ',
            ' governo ', ' ministro ', ' accordo ', ' tensioni ', ' paese ', ' fonti ',
        ];
        $englishMarkers = [
            ' the ', ' and ', ' with ', ' from ', ' that ', ' this ', ' these ', ' those ',
            ' government ', ' officials ', ' according to ', ' said ', ' will ', ' would ',
        ];

        $sample = ' '.Str::lower(trim($text)).' ';

        $italianScore = 0;
        foreach ($italianMarkers as $marker) {
            if (str_contains($sample, $marker)) {
                $italianScore++;
            }
        }

        $englishScore = 0;
        foreach ($englishMarkers as $marker) {
            if (str_contains($sample, $marker)) {
                $englishScore++;
            }
        }

        if ($italianScore >= 3 && $englishScore <= 2) {
            return true;
        }

        return $italianScore > $englishScore + 1;
    }
}
