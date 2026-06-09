<?php

namespace App\Services;

class ArticleImageFallbackService
{
    /**
     * @return array{bytes: string, mime: string}
     */
    public function placeholder(string $title, string $variant = 'cover'): array
    {
        $isThumb = $variant === 'thumb';
        $width = $isThumb ? 512 : 1200;
        $height = $isThumb ? 512 : 630;
        $fontSize = $isThumb ? 22 : 34;
        $titleLines = $this->titleLines($title, $isThumb ? 34 : 46);
        $safeLineOne = htmlspecialchars($titleLines[0], ENT_QUOTES | ENT_XML1, 'UTF-8');
        $safeLineTwo = htmlspecialchars($titleLines[1] ?? '', ENT_QUOTES | ENT_XML1, 'UTF-8');
        $titleY = $isThumb ? 308 : 382;
        $lineGap = $isThumb ? 30 : 44;
        $brandY = $isThumb ? 214 : 254;
        $brandFontSize = $isThumb ? 26 : 40;
        $headerInset = $isThumb ? 34 : 54;
        $headerTop = $isThumb ? 68 : 76;
        $logoWidth = $isThumb ? 56 : 78;
        $logoHeight = $isThumb ? 38 : 52;
        $headerLabelX = $headerInset + $logoWidth + ($isThumb ? 14 : 18);
        $headerLabelY = $headerTop + ($isThumb ? 15 : 20);
        $headerMetaY = $headerTop + ($isThumb ? 32 : 40);
        $headerLabelFontSize = $isThumb ? 12 : 15;
        $headerMetaFontSize = $isThumb ? 11 : 14;
        $rightBlockX = $width - $headerInset;
        $rightLabelY = $headerTop + ($isThumb ? 13 : 16);
        $rightTitleY = $headerTop + ($isThumb ? 30 : 36);
        $rightRuleY = $headerTop + ($isThumb ? 39 : 48);
        $rightMetaY = $headerTop + ($isThumb ? 55 : 67);
        $rightRuleStartX = $rightBlockX - ($isThumb ? 84 : 138);
        $rightLabelFontSize = $isThumb ? 10 : 12;
        $rightTitleFontSize = $isThumb ? 13 : 16;
        $rightMetaFontSize = $isThumb ? 10 : 12;
        $logoDataUri = $this->logoDataUri();
        $titleMarkup = $safeLineTwo !== ''
            ? "<tspan x=\"50%\">{$safeLineOne}</tspan>\n                <tspan x=\"50%\" dy=\"{$lineGap}\">{$safeLineTwo}</tspan>"
            : "<tspan x=\"50%\">{$safeLineOne}</tspan>";
        $logoMarkup = $logoDataUri !== ''
            ? "<image href=\"{$logoDataUri}\" x=\"{$headerInset}\" y=\"{$headerTop}\" width=\"{$logoWidth}\" height=\"{$logoHeight}\" preserveAspectRatio=\"xMinYMid meet\"/>"
            : "<text x=\"{$headerInset}\" y=\"".($headerTop + (int) ($logoHeight * 0.7)).'" fill="#d6a85a" font-size="'.($isThumb ? 18 : 24).'" font-family="Georgia, Times New Roman, serif" font-weight="700">LDG</text>';

        $svg = <<<SVG
            <svg xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 0 {$width} {$height}">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#081421"/>
                <stop offset="48%" stop-color="#10253a"/>
                <stop offset="100%" stop-color="#24131d"/>
                </linearGradient>
                <radialGradient id="glow" cx="22%" cy="18%" r="72%">
                <stop offset="0%" stop-color="#d6a85a" stop-opacity="0.28"/>
                <stop offset="52%" stop-color="#d6a85a" stop-opacity="0.08"/>
                <stop offset="100%" stop-color="#d6a85a" stop-opacity="0"/>
                </radialGradient>
                <radialGradient id="flare" cx="85%" cy="78%" r="56%">
                <stop offset="0%" stop-color="#b33f4f" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#b33f4f" stop-opacity="0"/>
                </radialGradient>
                <radialGradient id="vignette" cx="50%" cy="50%" r="80%">
                <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
                <stop offset="100%" stop-color="#000000" stop-opacity="0.34"/>
                </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#bg)"/>
            <rect width="100%" height="100%" fill="url(#glow)"/>
            <rect width="100%" height="100%" fill="url(#flare)"/>
            <rect width="100%" height="100%" fill="url(#vignette)"/>

            {$logoMarkup}

            <text
                x="{$headerLabelX}"
                y="{$headerLabelY}"
                fill="#f8fafc"
                font-size="{$headerLabelFontSize}"
                font-family="Arial, Helvetica, sans-serif"
                font-weight="700"
                letter-spacing="1.6"
            >
                LINEA DI GIOCO
            </text>

            <text
                x="{$headerLabelX}"
                y="{$headerMetaY}"
                fill="#aebdcb"
                font-size="{$headerMetaFontSize}"
                font-family="Arial, Helvetica, sans-serif"
                letter-spacing="0.4"
            >
                Briefing geopolitico e scenari internazionali
            </text>

            <text
                x="{$rightBlockX}"
                y="{$rightLabelY}"
                fill="#d6a85a"
                font-size="{$rightLabelFontSize}"
                font-family="Arial, Helvetica, sans-serif"
                font-weight="600"
                letter-spacing="1.4"
                text-anchor="end"
            >
                OSSERVATORIO
            </text>

            <text
                x="{$rightBlockX}"
                y="{$rightTitleY}"
                fill="#f8fafc"
                font-size="{$rightTitleFontSize}"
                font-family="Georgia, Times New Roman, serif"
                font-weight="700"
                text-anchor="end"
            >
                Scenario Brief
            </text>

            <line x1="{$rightBlockX}" y1="{$rightRuleY}" x2="{$rightBlockX}" y2="{$rightRuleY}" stroke="#d6a85a" stroke-width="2"/>
            <line x1="{$rightBlockX}" y1="{$rightRuleY}" x2="{$rightRuleStartX}" y2="{$rightRuleY}" stroke="#d6a85a" stroke-opacity="0.45" stroke-width="2"/>

            <text
                x="{$rightBlockX}"
                y="{$rightMetaY}"
                fill="#aebdcb"
                font-size="{$rightMetaFontSize}"
                font-family="Arial, Helvetica, sans-serif"
                letter-spacing="0.5"
                text-anchor="end"
            >
                analisi, crisi, deterrenza
            </text>

            <text
                x="50%"
                y="{$brandY}"
                text-anchor="middle"
                fill="#f8fafc"
                font-size="{$brandFontSize}"
                font-family="Georgia, Times New Roman, serif"
                font-weight="700"
                letter-spacing="1.2"
            >
                Linea di Gioco
            </text>

            <text
                x="50%"
                y="{$titleY}"
                text-anchor="middle"
                fill="#dbe4ee"
                font-size="{$fontSize}"
                font-family="Arial, Helvetica, sans-serif"
                font-weight="600"
            >
                {$titleMarkup}
            </text>

            </svg>
        SVG;

        return [
            'bytes' => $svg,
            'mime' => 'image/svg+xml',
        ];
    }

    /**
     * @return array{0: string, 1?: string}
     */
    private function titleLines(string $title, int $maxCharsPerLine): array
    {
        $normalized = preg_replace('/\s+/u', ' ', trim($title)) ?? '';
        if ($normalized === '') {
            return ['Analisi geopolitica'];
        }

        if (mb_strlen($normalized) <= $maxCharsPerLine) {
            return [$normalized];
        }

        $words = preg_split('/\s+/u', $normalized) ?: [];
        $firstLine = '';
        $secondLine = '';

        foreach ($words as $index => $word) {
            $candidate = trim($firstLine === '' ? $word : "{$firstLine} {$word}");
            if ($firstLine === '' || mb_strlen($candidate) <= $maxCharsPerLine) {
                $firstLine = $candidate;

                continue;
            }

            $secondLine = trim(implode(' ', array_slice($words, $index)));
            break;
        }

        if ($secondLine === '') {
            $firstLine = mb_substr($normalized, 0, $maxCharsPerLine);
            $secondLine = mb_substr($normalized, $maxCharsPerLine);
        }

        $firstLine = trim($firstLine);
        $secondLine = trim($secondLine);

        if ($secondLine === '') {
            return [$firstLine];
        }

        if (mb_strlen($secondLine) > $maxCharsPerLine) {
            $secondLine = rtrim(mb_substr($secondLine, 0, max(1, $maxCharsPerLine - 1)));
            $secondLine .= '...';
        }

        return [$firstLine, $secondLine];
    }

    private function logoDataUri(): string
    {
        static $cached = null;

        if ($cached !== null) {
            return $cached;
        }

        $path = resource_path('js/assets/linea-di-gioco-logo.webp');
        if (! is_file($path)) {
            return $cached = '';
        }

        $bytes = @file_get_contents($path);

        if (! is_string($bytes) || $bytes === '') {
            return $cached = '';
        }

        return $cached = 'data:image/webp;base64,'.base64_encode($bytes);
    }
}
