<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();

            // Contenuto
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('content');

            // Classificazione
            $table->string('topic')->nullable();

            // Stato editoriale
            $table->enum('status', ['draft', 'review', 'published'])
                ->default('draft')
                ->index();

            // Origine contenuto
            $table->enum('created_by', ['admin', 'ai'])
                ->default('admin')
                ->index();

            // Pubblicazione
            $table->timestamp('published_at')->nullable();

            // Sicurezza / rollback
            $table->softDeletes();
            $table->timestamps();

            // Performance
            $table->index(['status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
