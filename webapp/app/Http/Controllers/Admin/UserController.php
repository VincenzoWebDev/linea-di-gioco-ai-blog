<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users');
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users', [
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.users.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('Admin/Users', [
            'mode' => 'show',
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('Admin/Users', [
            'mode' => 'edit',
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        return redirect()->route('admin.users.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        return redirect()->route('admin.users.index');
    }
}
