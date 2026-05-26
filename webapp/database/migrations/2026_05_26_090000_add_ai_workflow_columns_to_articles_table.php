<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('workflow_session_key')->nullable()->after('published_at')->index();
            $table->timestamp('workflow_triggered_at')->nullable()->after('workflow_session_key')->index();
            $table->unsignedTinyInteger('workflow_trigger_hour')->nullable()->after('workflow_triggered_at');
            $table->unsignedTinyInteger('workflow_session_ai_quota')->nullable()->after('workflow_trigger_hour');
            $table->unsignedSmallInteger('workflow_session_rank')->nullable()->after('workflow_session_ai_quota');
            $table->string('image_generation_mode')->nullable()->after('workflow_session_rank')->index();
            $table->timestamp('ai_image_generated_at')->nullable()->after('image_generation_mode')->index();
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn([
                'workflow_session_key',
                'workflow_triggered_at',
                'workflow_trigger_hour',
                'workflow_session_ai_quota',
                'workflow_session_rank',
                'image_generation_mode',
                'ai_image_generated_at',
            ]);
        });
    }
};
