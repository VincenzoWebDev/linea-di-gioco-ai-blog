<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE `incoming_news` MODIFY `external_id` TEXT NULL, MODIFY `url` TEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op rollback: shrinking TEXT -> VARCHAR may fail if data exceeds 255 chars.
        // To avoid destructive truncation during automated refreshes, keep down() non-destructive.
        // If you need to revert to VARCHAR(255), manually truncate long values first, then alter.
        return;
    }
};
