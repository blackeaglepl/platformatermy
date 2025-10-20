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
        Schema::table('package_service_usage', function (Blueprint $table) {
            $table->string('variant_group')->nullable()->after('service_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_service_usage', function (Blueprint $table) {
            $table->dropColumn('variant_group');
        });
    }
};
