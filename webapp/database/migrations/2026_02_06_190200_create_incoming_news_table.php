<?php

use App\Enums\IncomingNewsStatus;
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
        Schema::create('incoming_news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('news_source_id')->constrained()->cascadeOnDelete();
            $table->string('external_id')->nullable();
            $table->string('url')->nullable();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->json('raw_payload');
            $table->json('sanitized_payload')->nullable();
            $table->string('fingerprint', 64)->unique();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamp('sanitized_at')->nullable();
            $table->string('status')->default(IncomingNewsStatus::RAW)->index();
            $table->decimal('quality_score', 5, 2)->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incoming_news');
    }
};

