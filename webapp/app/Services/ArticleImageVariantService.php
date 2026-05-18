<?php

namespace App\Services;

class ArticleImageVariantService
{
    /**
     * @return array{bytes: string, mime: string}
     */
    public function makeCover(string $sourceBytes, string $sourceMime): array
    {
        $width = max(320, (int) config('ai_news.images.cover_width', 1200));
        $height = max(180, (int) config('ai_news.images.cover_height', 630));
        $quality = $this->quality();

        return $this->makeRasterVariant($sourceBytes, $sourceMime, $width, $height, $quality);
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    public function makeThumb(string $sourceBytes, string $sourceMime): array
    {
        $size = max(128, (int) config('ai_news.images.thumb_size', 512));
        $quality = $this->quality();

        return $this->makeRasterVariant($sourceBytes, $sourceMime, $size, $size, $quality);
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    private function makeRasterVariant(
        string $sourceBytes,
        string $sourceMime,
        int $targetWidth,
        int $targetHeight,
        int $quality
    ): array {
        if (!extension_loaded('gd') || $this->isVectorMime($sourceMime)) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        $src = @imagecreatefromstring($sourceBytes);
        if (!$src) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        $srcW = imagesx($src);
        $srcH = imagesy($src);

        if ($srcW < 1 || $srcH < 1) {
            unset($src);

            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        $srcRatio = $srcW / $srcH;
        $targetRatio = $targetWidth / $targetHeight;

        if ($srcRatio > $targetRatio) {
            $cropH = $srcH;
            $cropW = (int) round($srcH * $targetRatio);
            $srcX = (int) floor(($srcW - $cropW) / 2);
            $srcY = 0;
        } else {
            $cropW = $srcW;
            $cropH = (int) round($srcW / $targetRatio);
            $srcX = 0;
            $srcY = (int) floor(($srcH - $cropH) / 2);
        }

        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
        imagefill($target, 0, 0, $transparent);

        imagecopyresampled(
            $target,
            $src,
            0,
            0,
            $srcX,
            $srcY,
            $targetWidth,
            $targetHeight,
            $cropW,
            $cropH
        );

        ob_start();
        imagewebp($target, null, $quality);
        $bytes = (string) ob_get_clean();

        unset($src, $target);

        if ($bytes === '') {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        return [
            'bytes' => $bytes,
            'mime' => 'image/webp',
        ];
    }

    private function isVectorMime(string $mime): bool
    {
        return str_contains(strtolower($mime), 'svg');
    }

    private function quality(): int
    {
        return min(100, max(30, (int) config('ai_news.images.webp_quality', 82)));
    }
}
