<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings');
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Settings', [
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.settings.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('Admin/Settings', [
            'mode' => 'show',
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('Admin/Settings', [
            'mode' => 'edit',
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        return redirect()->route('admin.settings.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        return redirect()->route('admin.settings.index');
    }
}
