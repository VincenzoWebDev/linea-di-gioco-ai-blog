<?php

use App\Http\Controllers\Blog\HomeController;
use App\Http\Controllers\Blog\ArticleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/newsletter', [HomeController::class, 'newsletter'])->name('newsletter');

Route::prefix('articoli')->name('blog.articles.')->group(function () {
    Route::get('/', [ArticleController::class, 'index'])->name('index');
    Route::get('/{slug}', function (string $slug) {
        $article = \App\Models\Article::query()
            ->where('status', 'published')
            ->where('slug', $slug)
            ->firstOrFail(['id', 'slug']);

        return redirect()->route('blog.articles.show', [
            'id' => $article->id,
            'slug' => $article->slug,
        ]);
    })->name('show.legacy');
    Route::get('/{id}/{slug}', [ArticleController::class, 'show'])->name('show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/admin.php';
require __DIR__ . '/auth.php';
