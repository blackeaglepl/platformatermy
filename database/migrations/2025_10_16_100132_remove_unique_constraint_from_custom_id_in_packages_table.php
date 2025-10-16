<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Remove UNIQUE constraint from custom_id to allow multiple packages
     * for the same person. package_id is already unique and sufficient.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropUnique(['custom_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * Restore UNIQUE constraint on custom_id.
     * WARNING: This will fail if duplicate custom_id values exist.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->unique('custom_id');
        });
    }
};
