<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            // Dodajemy nowe pole package_id jako nullable najpierw
            $table->string('package_id', 20)->nullable()->after('id');

            // Zmieniamy nazwę custom_id na owner_name
            $table->renameColumn('custom_id', 'owner_name');
        });

        // Generujemy package_id dla istniejących rekordów
        $packages = DB::table('packages')->orderBy('id')->get();
        foreach ($packages as $package) {
            // Generate package_id for existing records based on created_at date
            $date = \Carbon\Carbon::parse($package->created_at)->format('Ymd');

            // Find highest number for that date
            $lastPackageId = DB::table('packages')
                ->where('package_id', 'LIKE', $date . '-%')
                ->orderBy('package_id', 'desc')
                ->value('package_id');

            if ($lastPackageId) {
                $lastNumber = (int) substr($lastPackageId, -2);
                $nextNumber = $lastNumber + 1;
            } else {
                $nextNumber = 1;
            }

            $packageId = sprintf('%s-%02d', $date, $nextNumber);

            DB::table('packages')
                ->where('id', $package->id)
                ->update(['package_id' => $packageId]);
        }

        // Teraz możemy zmienić package_id na NOT NULL i UNIQUE
        Schema::table('packages', function (Blueprint $table) {
            $table->string('package_id', 20)->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            // Przywracamy nazwę owner_name -> custom_id
            $table->renameColumn('owner_name', 'custom_id');

            // Usuwamy package_id
            $table->dropColumn('package_id');
        });
    }
};
