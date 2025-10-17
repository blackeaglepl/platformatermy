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
        // Dodaj kolumny dla wariantów usług w package_type_services
        Schema::table('package_type_services', function (Blueprint $table) {
            $table->boolean('is_variant')->default(false)->after('quantity');
            $table->string('variant_group', 50)->nullable()->after('is_variant');
        });

        // Dodaj kolumnę dla numeracji instancji w package_service_usage
        Schema::table('package_service_usage', function (Blueprint $table) {
            $table->integer('instance_number')->nullable()->after('service_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_type_services', function (Blueprint $table) {
            $table->dropColumn(['is_variant', 'variant_group']);
        });

        Schema::table('package_service_usage', function (Blueprint $table) {
            $table->dropColumn('instance_number');
        });
    }
};
