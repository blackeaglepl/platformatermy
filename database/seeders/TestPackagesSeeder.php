<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\PackageService;
use App\Models\PackageServiceUsage;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestPackagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates 20 test packages with different usage statuses.
     */
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        // Polish first names
        $firstNames = [
            'Jan', 'Anna', 'Piotr', 'Maria', 'Krzysztof', 'Katarzyna',
            'Tomasz', 'Małgorzata', 'Andrzej', 'Agnieszka', 'Michał', 'Barbara',
            'Paweł', 'Ewa', 'Stanisław', 'Joanna', 'Marcin', 'Magdalena',
            'Zbigniew', 'Zofia'
        ];

        // Polish last names
        $lastNames = [
            'Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk',
            'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak',
            'Dąbrowski', 'Kozłowski', 'Jankowski', 'Mazur', 'Kwiatkowski',
            'Krawczyk', 'Piotrowski', 'Grabowski', 'Nowakowski', 'Pawłowski'
        ];

        $this->command->info('Creating 20 test packages...');

        for ($i = 0; $i < 20; $i++) {
            $firstName = $firstNames[$i];
            $lastName = $lastNames[$i];
            $suffix = rand(1000, 9999); // Add random suffix to ensure uniqueness
            $ownerName = "{$firstName} {$lastName} ({$suffix})";

            // Random package type (1-6)
            $packageType = rand(1, 6);

            // Create package
            $packageNumber = $i + 1;
            $package = Package::create([
                'owner_name' => $ownerName,
                'package_type' => $packageType,
                'created_by' => $user->id,
                'notes' => "Pakiet testowy #{$packageNumber}",
            ]);

            $this->command->info("Created package: {$package->package_id} for {$ownerName}");

            // Get services for this package type from package_type_services table
            $packageTypeServices = \DB::table('package_type_services')
                ->where('package_type', $packageType)
                ->get();

            // Create usage records for each service
            foreach ($packageTypeServices as $pts) {
                PackageServiceUsage::create([
                    'package_id' => $package->id,
                    'service_id' => $pts->service_id,
                    'used_at' => null,
                    'marked_by' => null,
                ]);
            }

            // Randomize usage status
            $usagePercentage = $this->getUsagePercentage($i);
            $this->markServicesAsUsed($package, $usagePercentage, $user->id);

            $this->command->info("  └─ Services marked: {$usagePercentage}%");
        }

        $this->command->info("\n✅ Successfully created 20 test packages!");
        $this->command->info("📊 Distribution:");
        $this->command->info("   - ~7 packages with 0% usage (aktywne)");
        $this->command->info("   - ~7 packages with 50% usage (aktywne)");
        $this->command->info("   - ~6 packages with 100% usage (wykorzystane)");
    }

    /**
     * Get usage percentage based on index for variety
     */
    private function getUsagePercentage(int $index): int
    {
        // Create variety: some 0%, some 50%, some 100%
        $pattern = $index % 3;

        return match($pattern) {
            0 => 0,      // Unused
            1 => 50,     // Half used
            2 => 100,    // Fully used
            default => 0,
        };
    }

    /**
     * Mark services as used based on percentage
     */
    private function markServicesAsUsed(Package $package, int $percentage, int $userId): void
    {
        if ($percentage === 0) {
            return; // No services used
        }

        $usages = $package->usages()->whereNull('used_at')->get();
        $totalServices = $usages->count();

        if ($totalServices === 0) {
            return;
        }

        $servicesToMark = round(($percentage / 100) * $totalServices);

        // Mark random services as used
        $usages->random(min($servicesToMark, $totalServices))->each(function ($usage) use ($userId) {
            $usage->update([
                'used_at' => now()->subDays(rand(1, 30)),
                'marked_by' => $userId,
                'notes' => 'Wykorzystano (test)',
            ]);
        });
    }
}
