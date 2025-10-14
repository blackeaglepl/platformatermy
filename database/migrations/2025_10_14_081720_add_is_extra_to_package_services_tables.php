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
        Schema::table('package_services', function (Blueprint $table) {
            $table->boolean('is_extra')->default(false)->after('duration');
        });

        Schema::table('package_type_services', function (Blueprint $table) {
            $table->boolean('is_extra')->default(false)->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_services', function (Blueprint $table) {
            $table->dropColumn('is_extra');
        });

        Schema::table('package_type_services', function (Blueprint $table) {
            $table->dropColumn('is_extra');
        });
    }
};
