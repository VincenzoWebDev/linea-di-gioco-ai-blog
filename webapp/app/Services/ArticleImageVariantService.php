<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ArticleImageVariantService
{
    /**
     * @return array{bytes: string, mime: string}
     */
    public function makeCover(string $sourceBytes, string $sourceMime): array
    {
        $width = max(320, (int) config('ai_news.images.cover_width', 1200));
        $height = max(180, (int) config('ai_news.images.cover_height', 630));

        return $this->makeRasterVariant(
            $sourceBytes,
            $sourceMime,
            $width,
            $height,
            $this->quality()
        );
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    public function makeThumb(string $sourceBytes, string $sourceMime): array
    {
        $size = max(128, (int) config('ai_news.images.thumb_size', 512));

        return $this->makeRasterVariant(
            $sourceBytes,
            $sourceMime,
            $size,
            $size,
            $this->quality()
        );
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
        if ($sourceBytes === '') {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        if (!str_starts_with(strtolower($sourceMime), 'image/')) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        if ($this->isVectorMime($sourceMime)) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        // 1. Imagick
        if ($this->supportsImagickWebp()) {
            $result = $this->makeImagickVariant(
                $sourceBytes,
                $sourceMime,
                $targetWidth,
                $targetHeight,
                $quality
            );

            if ($result['mime'] === 'image/webp') {
                return $result;
            }

            Log::warning('article_image_imagick_fallback_to_gd');
        }

        // 2. GD
        if ($this->supportsGdWebp()) {
            $result = $this->makeGdVariant(
                $sourceBytes,
                $sourceMime,
                $targetWidth,
                $targetHeight,
                $quality
            );

            if ($result['mime'] === 'image/webp') {
                return $result;
            }

            Log::warning('article_image_gd_fallback_to_original');
        }

        // 3. Originale
        Log::warning('article_image_webp_unsupported', $this->diagnostics());

        return [
            'bytes' => $sourceBytes,
            'mime' => $sourceMime,
        ];
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    private function makeGdVariant(
        string $sourceBytes,
        string $sourceMime,
        int $targetWidth,
        int $targetHeight,
        int $quality
    ): array {
        try {
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

            $success = imagewebp($target, null, $quality);

            $bytes = (string) ob_get_clean();

            unset($src, $target);

            if (!$success || $bytes === '') {
                return [
                    'bytes' => $sourceBytes,
                    'mime' => $sourceMime,
                ];
            }

            return [
                'bytes' => $bytes,
                'mime' => 'image/webp',
            ];
        } catch (\Throwable $e) {
            Log::warning('article_image_gd_failed', [
                ...$this->diagnostics(),
                'error' => $e->getMessage(),
            ]);

            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    private function makeImagickVariant(
        string $sourceBytes,
        string $sourceMime,
        int $targetWidth,
        int $targetHeight,
        int $quality
    ): array {
        try {
            $image = new \Imagick();

            $image->readImageBlob($sourceBytes);

            if ($image->getNumberImages() > 1) {
                $image = $image->coalesceImages();
                $image->setFirstIterator();
            }

            $image = $image->getImage();

            $image->setImageBackgroundColor(
                new \ImagickPixel('transparent')
            );

            $image->setImageAlphaChannel(
                \Imagick::ALPHACHANNEL_SET
            );

            $image->cropThumbnailImage(
                $targetWidth,
                $targetHeight
            );

            $image->setImageFormat('webp');

            $image->setImageCompressionQuality($quality);

            // Ottimizzazioni WebP
            $image->setOption('webp:method', '6');
            $image->setOption('webp:auto-filter', 'true');
            $image->setOption('webp:thread-level', '1');

            $image->stripImage();

            $bytes = $image->getImagesBlob();

            $image->clear();
            $image->destroy();

            if (!is_string($bytes) || $bytes === '') {
                return [
                    'bytes' => $sourceBytes,
                    'mime' => $sourceMime,
                ];
            }

            return [
                'bytes' => $bytes,
                'mime' => 'image/webp',
            ];
        } catch (\Throwable $e) {
            Log::warning('article_image_imagick_failed', [
                ...$this->diagnostics(),
                'error' => $e->getMessage(),
            ]);

            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }
    }

    private function isVectorMime(string $mime): bool
    {
        return str_contains(strtolower($mime), 'svg');
    }

    public function diagnostics(): array
    {
        $gdInfo = function_exists('gd_info')
            ? gd_info()
            : [];

        $imagickFormats = class_exists(\Imagick::class)
            ? array_map('strtoupper', \Imagick::queryFormats())
            : [];

        return [
            'gd_loaded' => extension_loaded('gd'),
            'gd_webp_support' => (bool) ($gdInfo['WebP Support'] ?? false),
            'gd_avif_support' => (bool) ($gdInfo['AVIF Support'] ?? false),

            'imagick_loaded' => extension_loaded('imagick'),
            'imagick_webp_support' => in_array(
                'WEBP',
                $imagickFormats,
                true
            ),

            'imagewebp_function' => function_exists('imagewebp'),
        ];
    }

    public function supportsWebpConversion(): bool
    {
        return
            $this->supportsImagickWebp()
            || $this->supportsGdWebp();
    }

    private function supportsGdWebp(): bool
    {
        if (
            !extension_loaded('gd')
            || !function_exists('imagewebp')
        ) {
            return false;
        }

        $gdInfo = function_exists('gd_info')
            ? gd_info()
            : [];

        return (bool) ($gdInfo['WebP Support'] ?? false);
    }

    private function supportsImagickWebp(): bool
    {
        if (
            !extension_loaded('imagick')
            || !class_exists(\Imagick::class)
        ) {
            return false;
        }

        return in_array(
            'WEBP',
            array_map(
                'strtoupper',
                \Imagick::queryFormats()
            ),
            true
        );
    }

    private function quality(): int
    {
        return min(
            100,
            max(
                30,
                (int) config('ai_news.images.webp_quality', 82)
            )
        );
    }
}
