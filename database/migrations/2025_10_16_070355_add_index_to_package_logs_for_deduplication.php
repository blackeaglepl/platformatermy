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
            // Add composite index for faster duplicate checking
            $table->index(['package_id', 'action_type', 'created_at'], 'idx_logs_deduplication');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_logs', function (Blueprint $table) {
            $table->dropIndex('idx_logs_deduplication');
        });
    }
};
