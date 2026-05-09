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
        Schema::create('article_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('article_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('action'); // created, updated, published, ai_generated
            $table->string('actor');  // admin | ai
            $table->json('payload')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_logs');
    }
};
