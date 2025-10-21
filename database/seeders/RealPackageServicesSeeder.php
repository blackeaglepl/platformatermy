<?php

namespace Database\Seeders;

use App\Models\PackageService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RealPackageServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // USUŃ WSZYSTKIE dummy dane
        DB::table('package_service_usage')->delete();
        DB::table('package_type_services')->delete();
        DB::table('package_services')->delete();

        // ========================================
        // STREFA ODNOWY (zone: odnowy)
        // ========================================

        PackageService::create([
            'id' => 1,
            'name' => 'Rytuał "Zmysłowa Odnowa" (księżycowa / mango)',
            'zone' => 'odnowy',
            'description' => 'Rytuał relaksacyjny - do wyboru wariant księżycowa lub mango',
            'duration' => 90,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 2,
            'name' => 'Zabieg Pielęgnacji Twarzy (peeling + masaż)',
            'zone' => 'odnowy',
            'description' => 'Peeling twarzy z masażem na kremie',
            'duration' => 30,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 3,
            'name' => 'Masaż klasyczny z okładami borowinowymi',
            'zone' => 'odnowy',
            'description' => '30 min masaż + 30 min okłady borowinowe',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 4,
            'name' => 'Masaż (ciepła świeca / czekolada)',
            'zone' => 'odnowy',
            'description' => 'Masaż do wyboru: ciepłą świecą lub ciepłą czekoladą',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 5,
            'name' => 'Masaż relaksacyjny',
            'zone' => 'odnowy',
            'description' => 'Klasyczny masaż relaksacyjny',
            'duration' => 30,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 6,
            'name' => 'Masaż masłem shea',
            'zone' => 'odnowy',
            'description' => 'Masaż całego ciała masłem shea',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 7,
            'name' => 'Peeling całego ciała',
            'zone' => 'odnowy',
            'description' => 'Peeling całego ciała',
            'duration' => 15,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 8,
            'name' => 'Masaż (klasyczny / ciepłe olejki)',
            'zone' => 'odnowy',
            'description' => 'Masaż do wyboru: klasyczny lub ciepłymi olejkami',
            'duration' => 60,
            'is_extra' => false,
        ]);

        // ========================================
        // STREFA RELAKSU (zone: relaksu)
        // ========================================

        PackageService::create([
            'id' => 9,
            'name' => 'Wejście do Strefy Relaksu (2,5 h)',
            'zone' => 'relaksu',
            'description' => 'Basen termalny, jacuzzi, sauny, grota solna - 2,5 godziny',
            'duration' => 150,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 10,
            'name' => 'Wejście do Strefy Relaksu (1,5 h)',
            'zone' => 'relaksu',
            'description' => 'Basen termalny, jacuzzi, sauny, grota solna - 1,5 godziny',
            'duration' => 90,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 11,
            'name' => 'Jacuzzi VIP (dla pary)',
            'zone' => 'relaksu',
            'description' => 'Jacuzzi VIP z 2 lampkami prosecco lub drinkami bezalkoholowymi',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 12,
            'name' => 'Jacuzzi VIP (dla grupy)',
            'zone' => 'relaksu',
            'description' => 'Jacuzzi VIP z butelką prosecco na grupę',
            'duration' => 60,
            'is_extra' => false,
        ]);

        // ========================================
        // STREFA SMAKU (zone: smaku)
        // ========================================

        PackageService::create([
            'id' => 13,
            'name' => 'Napar herbaciany do wyboru',
            'zone' => 'smaku',
            'description' => 'Napar herbaciany (na ciepło lub zimno)',
            'duration' => null,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 14,
            'name' => 'Deser + kawa lub herbata do wyboru',
            'zone' => 'smaku',
            'description' => 'Deser z napojem',
            'duration' => null,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 15,
            'name' => 'Romantyczna kolacja (voucher 200 zł)',
            'zone' => 'smaku',
            'description' => 'Voucher o wartości 200 zł do wykorzystania w restauracji',
            'duration' => null,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 16,
            'name' => 'Voucher Strefa Smaku (80 zł/os.)',
            'zone' => 'smaku',
            'description' => 'Voucher o wartości 80 zł do wykorzystania w Strefie Smaku',
            'duration' => null,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 17,
            'name' => 'Karafka lemoniady',
            'zone' => 'smaku',
            'description' => 'Karafka lemoniady',
            'duration' => null,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 18,
            'name' => 'Pizza margherita',
            'zone' => 'smaku',
            'description' => 'Pizza margherita',
            'duration' => null,
            'is_extra' => false,
        ]);

        // ========================================
        // EXTRA (zone: extra)
        // ========================================

        PackageService::create([
            'id' => 19,
            'name' => 'Wypożycz ręcznik i szlafrok',
            'zone' => 'extra',
            'description' => 'Przysługuje 1 raz dla każdej osoby z pakietu',
            'duration' => null,
            'is_extra' => true,
        ]);

        PackageService::create([
            'id' => 20,
            'name' => 'Masaż ciepłą świecą',
            'zone' => 'odnowy',
            'description' => 'Masaż całego ciała ciepłą świecą',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 21,
            'name' => 'Masaż ciepłą czekoladą',
            'zone' => 'odnowy',
            'description' => 'Masaż całego ciała ciepłą czekoladą',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 22,
            'name' => 'Masaż klasyczny',
            'zone' => 'odnowy',
            'description' => 'Masaż klasyczny całego ciała',
            'duration' => 60,
            'is_extra' => false,
        ]);

        PackageService::create([
            'id' => 23,
            'name' => 'Masaż ciepłymi olejkami',
            'zone' => 'odnowy',
            'description' => 'Masaż całego ciała ciepłymi olejkami',
            'duration' => 60,
            'is_extra' => false,
        ]);

        // ========================================
        // PAKIET 1: Naturalna Harmonia
        // ========================================
        DB::table('package_type_services')->insert([
            ['package_type' => 1, 'service_id' => 1, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 1, 'service_id' => 2, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 1, 'service_id' => 9, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 1, 'service_id' => 13, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 1, 'service_id' => 19, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => true],
        ]);

        // ========================================
        // PAKIET 2: Termalna Ulga
        // ========================================
        DB::table('package_type_services')->insert([
            ['package_type' => 2, 'service_id' => 3, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 2, 'service_id' => 10, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 2, 'service_id' => 14, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 2, 'service_id' => 19, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => true],
        ]);

        // ========================================
        // PAKIET 3: Szept Miłości (dla 2 osób!)
        // ========================================
        DB::table('package_type_services')->insert([
            // Warianty masażu dla Osoby 1
            ['package_type' => 3, 'service_id' => 20, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'osoba1_masaz', 'is_extra' => false],
            ['package_type' => 3, 'service_id' => 21, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'osoba1_masaz', 'is_extra' => false],
            // Warianty masażu dla Osoby 2
            ['package_type' => 3, 'service_id' => 20, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'osoba2_masaz', 'is_extra' => false],
            ['package_type' => 3, 'service_id' => 21, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'osoba2_masaz', 'is_extra' => false],
            // Pozostałe usługi (wspólne)
            ['package_type' => 3, 'service_id' => 11, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 3, 'service_id' => 10, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 3, 'service_id' => 10, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 3, 'service_id' => 15, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 3, 'service_id' => 19, 'quantity' => 2, 'is_variant' => false, 'variant_group' => null, 'is_extra' => true],
        ]);

        // ========================================
        // PAKIET 4: Kobiecy Chill (ma warianty!)
        // ========================================
        DB::table('package_type_services')->insert([
            // Wariant A - masaż relaksacyjny + zabieg twarzy
            ['package_type' => 4, 'service_id' => 5, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'odnowa_a', 'is_extra' => false],
            ['package_type' => 4, 'service_id' => 2, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'odnowa_a', 'is_extra' => false],
            // Wariant B - masaż shea + peeling
            ['package_type' => 4, 'service_id' => 6, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'odnowa_b', 'is_extra' => false],
            ['package_type' => 4, 'service_id' => 7, 'quantity' => 1, 'is_variant' => true, 'variant_group' => 'odnowa_b', 'is_extra' => false],
            // Pozostałe usługi
            ['package_type' => 4, 'service_id' => 12, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 4, 'service_id' => 9, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 4, 'service_id' => 16, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 4, 'service_id' => 19, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => true],
        ]);

        // ========================================
        // PAKIET 5: Wspólna Regeneracja (dla 2 osób!)
        // ========================================
        DB::table('package_type_services')->insert([
            // Wariant A - masaż klasyczny (dla 2 osób)
            ['package_type' => 5, 'service_id' => 22, 'quantity' => 2, 'is_variant' => true, 'variant_group' => 'masaz_a', 'is_extra' => false],
            // Wariant B - masaż ciepłymi olejkami (dla 2 osób)
            ['package_type' => 5, 'service_id' => 23, 'quantity' => 2, 'is_variant' => true, 'variant_group' => 'masaz_b', 'is_extra' => false],
            // Pozostałe usługi
            ['package_type' => 5, 'service_id' => 10, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false],
            ['package_type' => 5, 'service_id' => 16, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false], // 1x voucher (zmienione z 2x)
            ['package_type' => 5, 'service_id' => 19, 'quantity' => 2, 'is_variant' => false, 'variant_group' => null, 'is_extra' => true], // 2x ręcznik
        ]);

        // ========================================
        // PAKIET 6: Impreza Urodzinowa (dla 6 dzieci!)
        // ========================================
        DB::table('package_type_services')->insert([
            ['package_type' => 6, 'service_id' => 10, 'quantity' => 1, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false], // Wejście dla całej grupy
            ['package_type' => 6, 'service_id' => 17, 'quantity' => 2, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false], // 2x lemoniada
            ['package_type' => 6, 'service_id' => 18, 'quantity' => 3, 'is_variant' => false, 'variant_group' => null, 'is_extra' => false], // 3x pizza
            ['package_type' => 6, 'service_id' => 19, 'quantity' => 6, 'is_variant' => false, 'variant_group' => null, 'is_extra' => true], // 6x ręcznik
        ]);

        $this->command->info('✅ Seeded 23 real package services');
        $this->command->info('✅ Seeded package_type_services for all 6 package types');
    }
}
