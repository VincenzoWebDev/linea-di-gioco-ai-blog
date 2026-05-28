<?php

namespace App\Jobs\News;

use App\Services\ArticleImageFallbackService;
use App\Services\ArticleImageVariantService;
use App\Models\Article;
use App\Models\PublicationLog;
use App\Services\GoogleImageService;
use App\Services\News\AiNewsWorkflowService;
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
    public function __construct(public int $articleId) {}

    public function handle(
        // GeminiImageService $geminiImageService, deprecator in favore di GoogleImageService, ma lasciato per eventuale fallback o test A/B
        GoogleImageService $googleImageService,
        ArticleImageFallbackService $articleImageFallbackService,
        ArticleImageVariantService $articleImageVariantService,
        AiNewsWorkflowService $workflowService
    ): void {
        $article = Article::query()->find($this->articleId);
        if (! $article) {
            return;
        }

        $workflowService->synchronizeSessionAssignments($article);
        $article->refresh();

        $shouldAttemptAi = $article->image_generation_mode === 'ai'
            && $article->ai_image_generated_at === null;

        $coverIsPlaceholder = $this->isPlaceholderAsset($article->cover_path);
        $thumbIsPlaceholder = $this->isPlaceholderAsset($article->thumb_path);
        $coverNeedsOptimization = $this->needsOptimization($article->cover_path, $coverIsPlaceholder) || $shouldAttemptAi;
        $thumbNeedsOptimization = $this->needsOptimization($article->thumb_path, $thumbIsPlaceholder);

        if (! $coverNeedsOptimization && ! $thumbNeedsOptimization) {
            return;
        }

        $basePath = "articles/{$article->id}";
        $slug = $article->slug ?: 'article-' . $article->id;
        $updates = [];
        // $provider = (string) config('ai_news.images.provider', 'gemini'); 
        $aiImagesEnabled = (bool) config('ai_news.images.enabled', false);

        if (! $articleImageVariantService->supportsWebpConversion()) {
            Log::warning('article_image_webp_unavailable_for_job', [
                'article_id' => $article->id,
                ...$articleImageVariantService->diagnostics(),
            ]);
        }

        try {
            $generatedImage = null;
            $sourceBytes = null;
            $sourceMime = 'image/png';
            $generatedWithAi = false;

            if ($coverNeedsOptimization) {
                if ($shouldAttemptAi && $aiImagesEnabled) {
                    try {
                        $generatedImage = $googleImageService->generate($article->title, (string) $article->summary);
                        // $generatedWithAi = is_array($generatedImage);
                        $generatedWithAi = isset($generatedImage['bytes']) && $generatedImage['bytes'] !== '';
                    } catch (\Throwable $e) {
                        Log::warning('ai_news_image_generation_failed', [
                            'article_id' => $article->id,
                            'error' => $e->getMessage(),
                            'fallback' => 'svg_placeholder',
                        ]);
                    }
                }

                if (! is_array($generatedImage)) {
                    $generatedImage = $articleImageFallbackService->placeholder($article->title, 'cover');
                }

                $sourceBytes = (string) $generatedImage['bytes'];
                $sourceMime = (string) $generatedImage['mime'];
                $coverData = $articleImageVariantService->makeCover($sourceBytes, $sourceMime);
                $coverExt = $this->extensionFromMime($coverData['mime']);
                $coverPath = "{$basePath}/{$slug}-{$article->id}-cover.{$coverExt}";
                $this->deleteIfReplaceable($article->cover_path, $coverPath);
                Storage::disk('public')->put($coverPath, $coverData['bytes']);
                $updates['cover_path'] = $coverPath;
            }

            if ($thumbNeedsOptimization) {
                if (! is_string($sourceBytes) || $sourceBytes === '') {
                    $storedCoverPath = $article->cover_path;

                    if (
                        is_string($storedCoverPath)
                        && trim($storedCoverPath) !== ''
                        && Storage::disk('public')->exists($storedCoverPath)
                    ) {
                        $storedCoverBytes = Storage::disk('public')->get($storedCoverPath);

                        if (is_string($storedCoverBytes) && $storedCoverBytes !== '') {
                            $sourceBytes = $storedCoverBytes;
                            $sourceMime = match (strtolower(pathinfo($storedCoverPath, PATHINFO_EXTENSION))) {
                                'jpg', 'jpeg' => 'image/jpeg',
                                'png' => 'image/png',
                                'svg' => 'image/svg+xml',
                                'webp' => 'image/webp',
                                default => 'image/webp',
                            };
                        }
                    }

                    if (! is_string($sourceBytes) || $sourceBytes === '') {
                        $placeholder = $articleImageFallbackService->placeholder($article->title, 'thumb');
                        $sourceBytes = $placeholder['bytes'];
                        $sourceMime = $placeholder['mime'];
                    }
                }

                $thumbData = $articleImageVariantService->makeThumb($sourceBytes, $sourceMime);
                $thumbExt = $this->extensionFromMime($thumbData['mime']);
                $thumbPath = "{$basePath}/{$slug}-{$article->id}-thumb.{$thumbExt}";
                $this->deleteIfReplaceable($article->thumb_path, $thumbPath);
                Storage::disk('public')->put($thumbPath, $thumbData['bytes']);
                $updates['thumb_path'] = $thumbPath;
            }

            if ($updates !== []) {
                if ($generatedWithAi) {
                    $updates['ai_image_generated_at'] = now();
                }

                $article->update($updates);

                if ($generatedWithAi) {
                    PublicationLog::query()->create([
                        'article_id' => $article->id,
                        'event' => 'ai_image_generated',
                        'meta' => [
                            'mode' => $article->image_generation_mode,
                            'generated_at' => now()->toIso8601String(),
                        ],
                    ]);
                }
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

    private function needsOptimization(?string $path, bool $isPlaceholder): bool
    {
        if (! is_string($path) || trim($path) === '') {
            return true;
        }

        if ($isPlaceholder) {
            return false;
        }

        return strtolower(pathinfo($path, PATHINFO_EXTENSION)) !== 'webp';
    }

    private function deleteIfReplaceable(?string $currentPath, string $newPath): void
    {
        if (! is_string($currentPath) || trim($currentPath) === '' || $currentPath === $newPath) {
            return;
        }

        Storage::disk('public')->delete($currentPath);
    }
}
