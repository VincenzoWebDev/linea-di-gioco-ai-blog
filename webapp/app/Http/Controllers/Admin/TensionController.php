<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\GeopoliticalTension;
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
                        ->orWhere('status_label', 'like', "%{$search}%")
                        ->orWhere('featured_article_id', is_numeric($search) ? (int) $search : -1);
                });
            })
            ->orderByDesc('updated_at')
            ->paginate(15)
            ->withQueryString();

        $articles = Article::query()
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->limit(200)
            ->get(['id', 'title']);

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
            'risk_score' => ['required', 'integer', 'min:1', 'max:100'],
            'trend_direction' => ['required', 'in:rising,falling,stable'],
            'status_label' => ['required', 'string', 'max:80'],
            'featured_article_id' => ['nullable', 'integer', 'exists:articles,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        GeopoliticalTension::query()->create($validated);

        return redirect()->route('admin.tensions.index');
    }

    public function update(Request $request, GeopoliticalTension $tension): RedirectResponse
    {
        $validated = $request->validate([
            'region_name' => ['required', 'string', 'max:120'],
            'risk_score' => ['required', 'integer', 'min:1', 'max:100'],
            'trend_direction' => ['required', 'in:rising,falling,stable'],
            'status_label' => ['required', 'string', 'max:80'],
            'featured_article_id' => ['nullable', 'integer', 'exists:articles,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $tension->update($validated);

        return redirect()->route('admin.tensions.index');
    }

    public function destroy(GeopoliticalTension $tension): RedirectResponse
    {
        $tension->delete();

        return redirect()->route('admin.tensions.index');
    }
}
