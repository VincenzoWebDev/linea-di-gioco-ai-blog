<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cookie_consents', function (Blueprint $table) {
            $table->id();
            $table->string('anon_id')->nullable()->index();
            $table->ipAddress('ip')->nullable();

            $table->boolean('necessary')->default(true);
            $table->boolean('analytics')->default(false);
            $table->boolean('marketing')->default(false);

            $table->json('meta')->nullable();
            $table->string('policy_version')->default('v1.0');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cookie_consents');
    }
};
