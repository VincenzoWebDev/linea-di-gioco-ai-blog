<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('incoming_news', function (Blueprint $table) {
            $table->foreignId('merged_into_article_id')
                ->nullable()
                ->after('rejection_reason')
                ->constrained('articles')
                ->nullOnDelete();
            $table->foreignId('merged_into_incoming_news_id')
                ->nullable()
                ->after('merged_into_article_id')
                ->constrained('incoming_news')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('incoming_news', function (Blueprint $table) {
            if (Schema::getConnection()->getDriverName() === 'sqlite') {
                $table->dropColumn([
                    'merged_into_incoming_news_id',
                    'merged_into_article_id',
                ]);

                return;
            }

            $table->dropConstrainedForeignId('merged_into_incoming_news_id');
            $table->dropConstrainedForeignId('merged_into_article_id');
        });
    }
};
