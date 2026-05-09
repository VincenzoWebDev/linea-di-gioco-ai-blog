<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Pages');
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages', [
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.pages.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('Admin/Pages', [
            'mode' => 'show',
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('Admin/Pages', [
            'mode' => 'edit',
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        return redirect()->route('admin.pages.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        return redirect()->route('admin.pages.index');
    }
}
