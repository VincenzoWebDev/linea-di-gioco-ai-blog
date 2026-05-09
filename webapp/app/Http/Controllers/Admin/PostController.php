<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $createdBy = trim((string) $request->query('created_by', ''));
        $publication = trim((string) $request->query('publication', ''));
        $categoryIdsInput = trim((string) $request->query('category_ids', ''));
        $categoryIds = collect(explode(',', $categoryIdsInput))
            ->map(fn ($id) => (int) trim($id))
            ->filter(fn ($id) => $id > 0)
            ->values()
            ->all();

        $sort = trim((string) $request->query('sort', 'id'));
        $direction = strtolower(trim((string) $request->query('direction', 'desc')));
        $allowedSorts = ['id', 'title', 'status', 'publication_status', 'published_at', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $perPage = (int) $request->query('per_page', 15);
        if (! in_array($perPage, [10, 15, 25, 50], true)) {
            $perPage = 15;
        }

        $articles = Article::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%")
                        ->orWhere('id', is_numeric($search) ? (int) $search : -1);
                    $q->orWhereHas('categories', function ($cq) use ($search) {
                        $cq->where('categories.name', 'like', "%{$search}%")
                            ->orWhere('categories.slug', 'like', "%{$search}%");
                    });
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($createdBy !== '', fn ($query) => $query->where('created_by', $createdBy))
            ->when($categoryIds !== [], function ($query) use ($categoryIds) {
                $query->whereHas('categories', function ($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                });
            })
            ->when($publication === 'published', fn ($query) => $query->whereNotNull('published_at'))
            ->when($publication === 'unpublished', fn ($query) => $query->whereNull('published_at'))
            ->with('categories:id,name,slug')
            ->orderBy($sort, $direction)
            ->orderBy('id', 'desc')
            ->paginate($perPage, [
                'id',
                'title',
                'slug',
                'summary',
                'content',
                'status',
                'publication_status',
                'created_by',
                'published_at',
                'created_at',
                'cover_path',
                'thumb_path',
            ])
            ->withQueryString();

        return Inertia::render('Admin/Posts', [
            'articles' => $articles,
            'filters' => [
                'q' => $search,
                'status' => $status,
                'created_by' => $createdBy,
                'publication' => $publication,
                'category_ids' => implode(',', $categoryIds),
                'per_page' => $perPage,
            ],
            'sort' => [
                'field' => $sort,
                'direction' => $direction,
            ],
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Posts', [
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $categoryIds = collect((array) $request->input('category_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->values()
            ->all();
        $request->merge(['category_ids' => $categoryIds]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:articles,slug'],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'status' => ['required', 'string', 'in:draft,review,published'],
            'published_at' => ['nullable', 'date'],
            'cover' => ['required', 'image', 'max:5120'],
            'thumb' => ['required', 'image', 'max:2048'],
        ]);

        $validated['created_by'] = 'admin';

        DB::transaction(function () use ($validated, $request, $categoryIds) {
            $article = Article::create($validated);
            $article->categories()->sync($categoryIds);

            $paths = $this->storeImages($article, $request);
            $article->update($paths);
        });

        return redirect()->route('admin.posts.index');
    }

    public function show(Article $post): Response
    {
        return Inertia::render('Admin/Posts', [
            'mode' => 'show',
            'id' => $post->id,
        ]);
    }

    public function edit(Article $post): Response
    {
        return Inertia::render('Admin/Posts', [
            'mode' => 'edit',
            'id' => $post->id,
        ]);
    }

    public function update(Request $request, Article $post): RedirectResponse
    {
        $categoryIds = collect((array) $request->input('category_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->values()
            ->all();
        $request->merge(['category_ids' => $categoryIds]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('articles', 'slug')->ignore($post->id),
            ],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'status' => ['required', 'string', 'in:draft,review,published'],
            'published_at' => ['nullable', 'date'],
            'cover' => ['nullable', 'image', 'max:5120'],
            'thumb' => ['nullable', 'image', 'max:2048'],
        ]);

        DB::transaction(function () use ($validated, $request, $post, $categoryIds) {
            $post->update($validated);
            $post->categories()->sync($categoryIds);

            $paths = $this->storeImages($post, $request);
            if (!empty($paths)) {
                $post->update($paths);
            }
        });

        return redirect()->route('admin.posts.index');
    }

    public function destroy(Article $post): RedirectResponse
    {
        if ($post->cover_path) {
            Storage::disk('public')->delete($post->cover_path);
        }
        if ($post->thumb_path) {
            Storage::disk('public')->delete($post->thumb_path);
        }
        Storage::disk('public')->deleteDirectory("articles/{$post->id}");

        $post->delete();

        return redirect()->route('admin.posts.index');
    }

    private function storeImages(Article $article, Request $request): array
    {
        $paths = [];
        $basePath = "articles/{$article->id}";
        $slug = $article->slug;

        if ($request->hasFile('cover')) {
            if ($article->cover_path) {
                Storage::disk('public')->delete($article->cover_path);
            }
            $ext = $request->file('cover')->getClientOriginalExtension();
            $filename = "{$slug}-{$article->id}-cover.{$ext}";
            $paths['cover_path'] = $request->file('cover')->storeAs($basePath, $filename, 'public');
        }

        if ($request->hasFile('thumb')) {
            if ($article->thumb_path) {
                Storage::disk('public')->delete($article->thumb_path);
            }
            $ext = $request->file('thumb')->getClientOriginalExtension();
            $filename = "{$slug}-{$article->id}-thumb.{$ext}";
            $paths['thumb_path'] = $request->file('thumb')->storeAs($basePath, $filename, 'public');
        }

        return $paths;
    }
}
