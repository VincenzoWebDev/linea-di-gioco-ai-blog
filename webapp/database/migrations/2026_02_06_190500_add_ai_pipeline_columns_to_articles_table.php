<?php

use App\Enums\ArticlePublicationStatus;
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
        Schema::table('articles', function (Blueprint $table) {
            $table->foreignId('incoming_news_id')
                ->nullable()
                ->after('id')
                ->constrained('incoming_news')
                ->nullOnDelete();
            $table->string('source_url')->nullable()->after('thumb_path');
            $table->string('source_name')->nullable()->after('source_url');
            $table->boolean('ai_generated')->default(false)->after('source_name');
            $table->decimal('quality_score', 5, 2)->nullable()->after('ai_generated');
            $table->string('publication_status')
                ->default(ArticlePublicationStatus::DRAFT)
                ->after('status')
                ->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('incoming_news_id');
            $table->dropColumn([
                'source_url',
                'source_name',
                'ai_generated',
                'quality_score',
                'publication_status',
            ]);
        });
    }
};

