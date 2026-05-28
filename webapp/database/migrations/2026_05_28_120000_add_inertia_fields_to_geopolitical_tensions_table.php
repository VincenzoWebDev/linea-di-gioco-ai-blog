<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('geopolitical_tensions', function (Blueprint $table) {
            $table->timestamp('last_event_at')->nullable()->after('featured_article_id')->index();
            $table->timestamp('last_decay_at')->nullable()->after('last_event_at')->index();
        });

        DB::table('geopolitical_tensions')
            ->whereNull('last_event_at')
            ->update([
                'last_event_at' => DB::raw('updated_at'),
            ]);
    }

    public function down(): void
    {
        Schema::table('geopolitical_tensions', function (Blueprint $table) {
            $table->dropColumn(['last_event_at', 'last_decay_at']);
        });
    }
};
