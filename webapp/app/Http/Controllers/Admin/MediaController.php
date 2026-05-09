<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Media');
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Media', [
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.media.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('Admin/Media', [
            'mode' => 'show',
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('Admin/Media', [
            'mode' => 'edit',
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        return redirect()->route('admin.media.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        return redirect()->route('admin.media.index');
    }
}
