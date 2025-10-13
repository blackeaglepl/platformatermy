<?php

namespace Database\Seeders;

use App\Models\PackageService;
use Illuminate\Database\Seeder;

class PackageServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            // Strefa Relaksu
            [
                'name' => 'Basen termalny (2h)',
                'zone' => 'relaksu',
                'description' => 'Relaksujący wypoczynek w basenie termalnym',
                'duration' => 120,
            ],
            [
                'name' => 'Jacuzzi (30 min)',
                'zone' => 'relaksu',
                'description' => 'Masaż wodny w jacuzzi',
                'duration' => 30,
            ],
            [
                'name' => 'Leżaki termalne (1h)',
                'zone' => 'relaksu',
                'description' => 'Wypoczynek na podgrzewanych leżakach',
                'duration' => 60,
            ],

            // Strefa Odnowy
            [
                'name' => 'Masaż relaksacyjny (60 min)',
                'zone' => 'odnowy',
                'description' => 'Pełen masaż ciała',
                'duration' => 60,
            ],
            [
                'name' => 'Sauna fińska (30 min)',
                'zone' => 'odnowy',
                'description' => 'Sesja w saunie fińskiej',
                'duration' => 30,
            ],
            [
                'name' => 'Grota solna (45 min)',
                'zone' => 'odnowy',
                'description' => 'Terapia w grocie solnej',
                'duration' => 45,
            ],
            [
                'name' => 'Peeling ciała (30 min)',
                'zone' => 'odnowy',
                'description' => 'Peeling całego ciała',
                'duration' => 30,
            ],
            [
                'name' => 'Masaż gorącymi kamieniami (45 min)',
                'zone' => 'odnowy',
                'description' => 'Relaksacyjny masaż z użyciem gorących kamieni',
                'duration' => 45,
            ],

            // Strefa Smaku
            [
                'name' => 'Kolacja degustacyjna',
                'zone' => 'smaku',
                'description' => 'Menu degustacyjne z 5 dań',
                'duration' => null,
            ],
            [
                'name' => 'Napoje ziołowe',
                'zone' => 'smaku',
                'description' => 'Zestaw regionalnych napojów ziołowych',
                'duration' => null,
            ],
            [
                'name' => 'Śniadanie górskie',
                'zone' => 'smaku',
                'description' => 'Tradycyjne śniadanie z lokalnych produktów',
                'duration' => null,
            ],
            [
                'name' => 'Deser terminalny',
                'zone' => 'smaku',
                'description' => 'Autorski deser szefa kuchni',
                'duration' => null,
            ],
        ];

        foreach ($services as $service) {
            PackageService::create($service);
        }
    }
}
