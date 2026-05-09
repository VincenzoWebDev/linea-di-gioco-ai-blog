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
        Schema::create('external_sources', function (Blueprint $table) {
            $table->id();

            // Da dove arriva l'informazione
            $table->string('source'); // es: rss, reuters, ap, google_news
            $table->string('external_id')->nullable();
            $table->string('url')->nullable();

            // Deduplica contenuti
            $table->string('content_hash', 64)->index();

            // Metadata utili
            $table->string('topic')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            $table->unique(['source', 'content_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_sources');
    }
};
