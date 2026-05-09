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
        Schema::table('incoming_news', function (Blueprint $table) {
            $table->longText('source_content')->nullable()->after('summary');
            $table->timestamp('extracted_at')->nullable()->after('published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incoming_news', function (Blueprint $table) {
            $table->dropColumn(['source_content', 'extracted_at']);
        });
    }
};

