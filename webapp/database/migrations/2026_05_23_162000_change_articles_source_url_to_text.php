<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `articles` MODIFY `source_url` TEXT NULL');
        }
    }

    public function down(): void
    {
        // Non-destructive rollback: during migrate:refresh the table will be dropped by the
        // original create migration, while shrinking TEXT back to VARCHAR(255) may fail on
        // existing data and would risk silent truncation.

    }
};
