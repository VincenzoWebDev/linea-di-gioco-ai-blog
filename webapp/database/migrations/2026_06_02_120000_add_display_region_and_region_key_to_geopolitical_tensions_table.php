<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('geopolitical_tensions', function (Blueprint $table) {
            $table->string('display_region_name')->nullable()->after('region_name');
            $table->string('region_key')->nullable()->after('display_region_name');
            $table->index('display_region_name');
            $table->unique('region_key');
        });
    }

    public function down(): void
    {
        Schema::table('geopolitical_tensions', function (Blueprint $table) {
            $table->dropIndex(['display_region_name']);
            $table->dropUnique(['region_key']);
            $table->dropColumn(['display_region_name', 'region_key']);
        });
    }
};
