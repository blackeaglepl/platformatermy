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
        Schema::table('package_logs', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('details'); // IPv6 support (max 45 chars)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_logs', function (Blueprint $table) {
            $table->dropColumn('ip_address');
        });
    }
};
