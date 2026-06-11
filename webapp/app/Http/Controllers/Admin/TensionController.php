<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\GeopoliticalTension;
use App\Services\GeopoliticalTensionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TensionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));

        $tensions = GeopoliticalTension::query()
            ->with('featuredArticle:id,title,status')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('region_name', 'like', "%{$search}%")
                        ->orWhere('display_region_name', 'like', "%{$search}%")
                        ->orWhere('region_key', 'like', "%{$search}%")
                        ->orWhere('status_label', 'like', "%{$search}%")
                        ->orWhere('featured_article_id', is_numeric($search) ? (int) $search : -1)
                        ->orWhereHas('featuredArticle', function ($articleQuery) use ($search) {
                            $articleQuery->where('title', 'like', "%{$search}%")
                                ->orWhere('slug', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('updated_at')
            ->paginate(15)
            ->withQueryString();

        $articles = Article::query()
            ->orderByDesc('updated_at')
            ->limit(500)
            ->get(['id', 'title', 'status']);

        return Inertia::render('Admin/Tensions', [
            'tensions' => $tensions,
            'filters' => ['q' => $search],
            'articles' => $articles,
            'stats' => [
                'total' => GeopoliticalTension::query()->count(),
                'high' => GeopoliticalTension::query()->where('risk_score', '>=', 70)->count(),
                'avg' => round((float) GeopoliticalTension::query()->avg('risk_score'), 1),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'region_name' => ['required', 'string', 'max:120'],
            'display_region_name' => ['nullable', 'string', 'max:180'],
            'risk_score' => ['required', 'integer', 'min:1', 'max:100'],
            'trend_direction' => ['required', 'in:rising,falling,stable'],
            'status_label' => ['required', 'string', 'max:80'],
            'featured_article_id' => ['required', 'integer', 'exists:articles,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $service = app(GeopoliticalTensionService::class);
        $displayRegionName = trim((string) ($validated['display_region_name'] ?? $validated['region_name']));

        GeopoliticalTension::query()->create([
            ...$validated,
            'display_region_name' => $displayRegionName !== '' ? $displayRegionName : $validated['region_name'],
            'region_key' => $service->buildRegionKey(
                (string) $validated['region_name'],
                $displayRegionName !== '' ? $displayRegionName : (string) $validated['region_name']
            ),
            'last_event_at' => now(),
        ]);
        $service->clearHeaderCache();

        return redirect()->route('admin.tensions.index');
    }

    public function update(Request $request, GeopoliticalTension $tension): RedirectResponse
    {
        $validated = $request->validate([
            'region_name' => ['required', 'string', 'max:120'],
            'display_region_name' => ['nullable', 'string', 'max:180'],
            'risk_score' => ['required', 'integer', 'min:1', 'max:100'],
            'trend_direction' => ['required', 'in:rising,falling,stable'],
            'status_label' => ['required', 'string', 'max:80'],
            'featured_article_id' => ['required', 'integer', 'exists:articles,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $service = app(GeopoliticalTensionService::class);
        $displayRegionName = trim((string) ($validated['display_region_name'] ?? $validated['region_name']));

        $tension->update([
            ...$validated,
            'display_region_name' => $displayRegionName !== '' ? $displayRegionName : $validated['region_name'],
            'region_key' => $service->buildRegionKey(
                (string) $validated['region_name'],
                $displayRegionName !== '' ? $displayRegionName : (string) $validated['region_name']
            ),
            'last_event_at' => now(),
        ]);
        $service->clearHeaderCache();

        return redirect()->route('admin.tensions.index');
    }

    public function destroy(GeopoliticalTension $tension): RedirectResponse
    {
        $tension->delete();
        app(GeopoliticalTensionService::class)->clearHeaderCache();

        return redirect()->route('admin.tensions.index');
    }
}
