<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Geopolitica', 'description' => 'Relazioni internazionali e aree di crisi'],
            ['name' => 'Diplomazia', 'description' => 'Vertici, negoziati e politica estera'],
            ['name' => 'Conflitti', 'description' => 'Guerre, cessate il fuoco e sicurezza'],
            ['name' => 'Energia e Risorse', 'description' => 'Gas, petrolio e sicurezza energetica'],
            ['name' => 'Economia Globale', 'description' => 'Sanzioni, catene di fornitura e impatti macro'],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}

