<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Definicja typów pakietów
        // service_id odpowiada kolejności z PackageServiceSeeder (1-12)

        $packageTypes = [
            // Pakiet 1 - Podstawowy Relaks
            1 => [
                ['service_id' => 1, 'quantity' => 1], // Basen termalny
                ['service_id' => 2, 'quantity' => 1], // Jacuzzi
                ['service_id' => 10, 'quantity' => 1], // Napoje ziołowe
            ],

            // Pakiet 2 - Odnowa Express
            2 => [
                ['service_id' => 1, 'quantity' => 1], // Basen termalny
                ['service_id' => 5, 'quantity' => 1], // Sauna fińska
                ['service_id' => 6, 'quantity' => 1], // Grota solna
                ['service_id' => 11, 'quantity' => 1], // Śniadanie górskie
            ],

            // Pakiet 3 - Komfort & Smak
            3 => [
                ['service_id' => 1, 'quantity' => 1], // Basen termalny
                ['service_id' => 4, 'quantity' => 1], // Masaż relaksacyjny
                ['service_id' => 5, 'quantity' => 1], // Sauna fińska
                ['service_id' => 9, 'quantity' => 1], // Kolacja degustacyjna
                ['service_id' => 10, 'quantity' => 1], // Napoje ziołowe
            ],

            // Pakiet 4 - Premium Wellness
            4 => [
                ['service_id' => 1, 'quantity' => 1], // Basen termalny
                ['service_id' => 2, 'quantity' => 1], // Jacuzzi
                ['service_id' => 3, 'quantity' => 1], // Leżaki termalne
                ['service_id' => 4, 'quantity' => 1], // Masaż relaksacyjny
                ['service_id' => 5, 'quantity' => 1], // Sauna fińska
                ['service_id' => 6, 'quantity' => 1], // Grota solna
                ['service_id' => 9, 'quantity' => 1], // Kolacja degustacyjna
                ['service_id' => 12, 'quantity' => 1], // Deser termalny
            ],

            // Pakiet 5 - Spa Exclusive
            5 => [
                ['service_id' => 1, 'quantity' => 1], // Basen termalny
                ['service_id' => 2, 'quantity' => 2], // Jacuzzi x2
                ['service_id' => 4, 'quantity' => 1], // Masaż relaksacyjny
                ['service_id' => 7, 'quantity' => 1], // Peeling ciała
                ['service_id' => 8, 'quantity' => 1], // Masaż gorącymi kamieniami
                ['service_id' => 9, 'quantity' => 1], // Kolacja degustacyjna
                ['service_id' => 10, 'quantity' => 1], // Napoje ziołowe
                ['service_id' => 11, 'quantity' => 1], // Śniadanie górskie
            ],

            // Pakiet 6 - Total Relax VIP
            6 => [
                ['service_id' => 1, 'quantity' => 2], // Basen termalny x2
                ['service_id' => 2, 'quantity' => 2], // Jacuzzi x2
                ['service_id' => 3, 'quantity' => 1], // Leżaki termalne
                ['service_id' => 4, 'quantity' => 2], // Masaż relaksacyjny x2
                ['service_id' => 5, 'quantity' => 1], // Sauna fińska
                ['service_id' => 6, 'quantity' => 1], // Grota solna
                ['service_id' => 7, 'quantity' => 1], // Peeling ciała
                ['service_id' => 8, 'quantity' => 1], // Masaż gorącymi kamieniami
                ['service_id' => 9, 'quantity' => 1], // Kolacja degustacyjna
                ['service_id' => 10, 'quantity' => 2], // Napoje ziołowe x2
                ['service_id' => 11, 'quantity' => 1], // Śniadanie górskie
                ['service_id' => 12, 'quantity' => 1], // Deser termalny
            ],
        ];

        foreach ($packageTypes as $packageType => $services) {
            foreach ($services as $service) {
                DB::table('package_type_services')->insert([
                    'package_type' => $packageType,
                    'service_id' => $service['service_id'],
                    'quantity' => $service['quantity'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
