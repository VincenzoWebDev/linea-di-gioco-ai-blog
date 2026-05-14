<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geopolitical_tensions', function (Blueprint $table) {
            $table->id();
            $table->string('region_name')->unique();
            $table->unsignedTinyInteger('risk_score');
            $table->enum('trend_direction', ['rising', 'falling', 'stable'])->default('stable');
            $table->string('status_label');
            $table->foreignId('featured_article_id')
                ->nullable()
                ->constrained('articles')
                ->nullOnDelete();
            $table->timestamp('updated_at')->nullable();

            $table->index('risk_score');
            $table->index('trend_direction');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geopolitical_tensions');
    }
};
