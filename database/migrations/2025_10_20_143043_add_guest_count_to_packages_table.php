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
        Schema::table('packages', function (Blueprint $table) {
            // Liczba osób korzystających z pakietu (tylko dla pakietów 4-6)
            // Nullable - używane tylko dla Kobiecy Chill, Wspólna Regeneracja, Impreza Urodzinowa
            // NIE wpływa na procent wykorzystania - tylko informacja dla personelu
            $table->unsignedInteger('guest_count')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('guest_count');
        });
    }
};
