<?php

namespace App\Jobs\News;

use App\Models\Article;
use App\Services\ArticleImageFallbackService;
use App\Services\GeminiImageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateArticleImagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public array $backoff = [60, 180, 600, 1200];

    /**
     * @param  int  $articleId
     */
    public function __construct(public int $articleId)
    {
    }

    public function handle(
        GeminiImageService $geminiImageService,
        ArticleImageFallbackService $articleImageFallbackService
    ): void
    {
        $article = Article::query()->find($this->articleId);
        if (! $article) {
            return;
        }

        $coverIsPlaceholder = $this->isPlaceholderAsset($article->cover_path);
        $thumbIsPlaceholder = $this->isPlaceholderAsset($article->thumb_path);

        if ($article->cover_path && $article->thumb_path && ! $coverIsPlaceholder && ! $thumbIsPlaceholder) {
            return;
        }

        $basePath = "articles/{$article->id}";
        $slug = $article->slug ?: 'article-'.$article->id;
        $updates = [];
        $provider = (string) config('ai_news.images.provider', 'gemini');
        $aiImagesEnabled = (bool) config('ai_news.images.enabled', false);

        try {
            $generatedImage = null;
            if (! $article->cover_path || $coverIsPlaceholder) {
                if ($aiImagesEnabled && $provider === 'gemini') {
                    try {
                        $generatedImage = $geminiImageService->generate($article->title, (string) $article->summary, 'cover');
                    } catch (\Throwable $geminiError) {
                        Log::warning('ai_news_image_generation_failed', [
                            'article_id' => $article->id,
                            'error' => $geminiError->getMessage(),
                            'fallback' => 'source_or_placeholder',
                        ]);
                    }
                }

                if (! is_array($generatedImage)) {
                    $generatedImage = $articleImageFallbackService->fetchFromSourceUrl($this->resolveSourceUrl($article));
                }
                if (! is_array($generatedImage)) {
                    $generatedImage = $articleImageFallbackService->placeholder($article->title, 'cover');
                }

                $coverExt = $this->extensionFromMime($generatedImage['mime']);
                $coverPath = "{$basePath}/{$slug}-{$article->id}-cover.{$coverExt}";
                Storage::disk('public')->put($coverPath, $generatedImage['bytes']);
                $updates['cover_path'] = $coverPath;
            }

            if (! $article->thumb_path || $thumbIsPlaceholder) {
                $sourceBytes = null;
                $sourceMime = 'image/png';

                if (is_array($generatedImage)) {
                    $sourceBytes = (string) $generatedImage['bytes'];
                    $sourceMime = (string) $generatedImage['mime'];
                } elseif ($article->cover_path && Storage::disk('public')->exists($article->cover_path)) {
                    $coverBytes = Storage::disk('public')->get($article->cover_path);
                    if ($coverBytes !== false) {
                        $sourceBytes = $coverBytes;
                        $sourceMime = $this->mimeFromExtension(pathinfo($article->cover_path, PATHINFO_EXTENSION));
                    }
                }

                if (! is_string($sourceBytes) || $sourceBytes === '') {
                    $placeholder = $articleImageFallbackService->placeholder($article->title, 'thumb');
                    $sourceBytes = $placeholder['bytes'];
                    $sourceMime = $placeholder['mime'];
                }

                $thumbData = $this->createThumbFromSource($sourceBytes, $sourceMime);
                $thumbExt = $this->extensionFromMime($thumbData['mime']);
                $thumbPath = "{$basePath}/{$slug}-{$article->id}-thumb.{$thumbExt}";
                Storage::disk('public')->put($thumbPath, $thumbData['bytes']);
                $updates['thumb_path'] = $thumbPath;
            }

            if ($updates !== []) {
                $article->update($updates);
            }
        } catch (\Throwable $e) {
            Log::warning('ai_news_image_generation_failed', [
                'article_id' => $article->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function extensionFromMime(string $mime): string
    {
        $normalized = strtolower(trim(explode(';', $mime)[0] ?? $mime));

        return match ($normalized) {
            'image/jpeg' => 'jpg',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
            default => 'png',
        };
    }

    private function mimeFromExtension(string $ext): string
    {
        return match (strtolower($ext)) {
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            default => 'image/png',
        };
    }

    private function resolveSourceUrl(Article $article): string
    {
        $article->loadMissing('incomingNews:id,url,raw_payload,sanitized_payload');

        $preferred = $this->preferUsableUrl(
            data_get($article->incomingNews, 'url'),
            data_get($article->incomingNews, 'sanitized_payload.source_url'),
            data_get($article->incomingNews, 'raw_payload.source_url'),
            data_get($article->incomingNews, 'raw_payload.url'),
            $article->source_url
        );

        if ($preferred !== '') {
            return $preferred;
        }

        return $this->preferNonEmptyString(
            data_get($article->incomingNews, 'url'),
            data_get($article->incomingNews, 'sanitized_payload.source_url'),
            data_get($article->incomingNews, 'raw_payload.source_url'),
            data_get($article->incomingNews, 'raw_payload.url'),
            $article->source_url
        );
    }

    private function isPlaceholderAsset(?string $path): bool
    {
        if (! is_string($path) || trim($path) === '') {
            return false;
        }

        if (! Storage::disk('public')->exists($path)) {
            return false;
        }

        if (strtolower(pathinfo($path, PATHINFO_EXTENSION)) !== 'svg') {
            return false;
        }

        $contents = Storage::disk('public')->get($path);
        if (! is_string($contents) || $contents === '') {
            return false;
        }

        return str_contains($contents, 'Linea di Gioco');
    }

    private function preferUsableUrl(mixed ...$values): string
    {
        foreach ($values as $value) {
            $normalized = trim((string) $value);
            if ($this->isUsableUrl($normalized)) {
                return $normalized;
            }
        }

        return '';
    }

    private function preferNonEmptyString(mixed ...$values): string
    {
        foreach ($values as $value) {
            $normalized = trim((string) $value);
            if ($normalized !== '') {
                return $normalized;
            }
        }

        return '';
    }

    private function isUsableUrl(string $value): bool
    {
        if ($value === '' || ! filter_var($value, FILTER_VALIDATE_URL)) {
            return false;
        }

        $host = strtolower((string) parse_url($value, PHP_URL_HOST));

        return ! in_array($host, ['example.com', 'www.example.com', 'news.example.com', 'dispatch.local'], true);
    }

    /**
     * @return array{bytes: string, mime: string}
     */
    private function createThumbFromSource(string $sourceBytes, string $sourceMime): array
    {
        if (! extension_loaded('gd')) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        if (str_contains(strtolower($sourceMime), 'svg')) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        $src = @imagecreatefromstring($sourceBytes);
        if (! $src) {
            return [
                'bytes' => $sourceBytes,
                'mime' => $sourceMime,
            ];
        }

        $srcW = imagesx($src);
        $srcH = imagesy($src);
        $size = min($srcW, $srcH);
        $srcX = (int) floor(($srcW - $size) / 2);
        $srcY = (int) floor(($srcH - $size) / 2);

        $thumbSize = 512;
        $thumb = imagecreatetruecolor($thumbSize, $thumbSize);
        imagecopyresampled($thumb, $src, 0, 0, $srcX, $srcY, $thumbSize, $thumbSize, $size, $size);

        ob_start();
        imagejpeg($thumb, null, 88);
        $bytes = (string) ob_get_clean();

        imagedestroy($src);
        imagedestroy($thumb);

        return [
            'bytes' => $bytes,
            'mime' => 'image/jpeg',
        ];
    }
}
