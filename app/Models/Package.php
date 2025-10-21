<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',      // Auto-generated: YYYYMMDD-XX
        'owner_name',      // Contains owner/recipient name
        'package_type',
        'created_by',
        'notes',
        'guest_count',     // Number of guests (only for package types 4-6: Kobiecy Chill, Wspólna Regeneracja, Impreza Urodzinowa)
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function services()
    {
        return $this->belongsToMany(PackageService::class, 'package_service_usage')
            ->withPivot('used_at', 'marked_by', 'notes')
            ->withTimestamps();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function usages()
    {
        return $this->hasMany(PackageServiceUsage::class);
    }

    public function logs()
    {
        return $this->hasMany(PackageLog::class);
    }

    /**
     * Get variant groups data for this package's usages
     * Returns usages with variant_group already present from package_service_usage table
     */
    public function getUsagesWithVariantGroups()
    {
        return $this->usages()
            ->with('service')
            ->get();
        // Note: variant_group is already available on each usage from package_service_usage table
        // No need to join with package_type_services
    }

    public function getUsagePercentageAttribute()
    {
        // Get all usages with variant_group info (excluding extra services)
        $allUsages = $this->getUsagesWithVariantGroups()
            ->filter(function ($usage) {
                return !$usage->service->is_extra;
            });

        if ($allUsages->isEmpty()) {
            return 0;
        }

        // Group usages by variant_group
        $variantGroups = [];
        $regularUsages = [];

        foreach ($allUsages as $usage) {
            if ($usage->variant_group) {
                // Extract base group name:
                // - Keep person-based variants separate: "osoba1_masaz", "osoba2_masaz" (each person = separate unit)
                // - Group other variants: "odnowa_a" → "odnowa" (all variants of same type = one unit)
                $baseGroupName = $usage->variant_group;

                // Check if it's NOT a person-based variant
                if (!preg_match('/^osoba\d+_/', $baseGroupName)) {
                    // For non-person variants, strip the suffix (e.g., "odnowa_a" → "odnowa")
                    $baseGroupName = preg_replace('/_[a-z]$/i', '', $baseGroupName);
                }
                // Otherwise keep full name: "osoba1_masaz" stays as is

                if (!isset($variantGroups[$baseGroupName])) {
                    $variantGroups[$baseGroupName] = [];
                }
                $variantGroups[$baseGroupName][] = $usage;
            } else {
                $regularUsages[] = $usage;
            }
        }

        // Count total logical units:
        // - Each variant group = 1 unit (regardless of how many variants/services inside)
        // - Each regular service = 1 unit
        $totalUnits = count($variantGroups) + count($regularUsages);

        if ($totalUnits === 0) {
            return 0;
        }

        // Count used units:
        // - Variant group is "used" if ANY service in ANY variant is used
        // - Regular service is "used" if it has used_at
        $usedUnits = 0;

        // Check variant groups
        foreach ($variantGroups as $groupName => $groupUsages) {
            $hasAnyUsed = collect($groupUsages)->some(fn($u) => !is_null($u->used_at));
            if ($hasAnyUsed) {
                $usedUnits++;
            }
        }

        // Check regular services
        foreach ($regularUsages as $usage) {
            if (!is_null($usage->used_at)) {
                $usedUnits++;
            }
        }

        return round(($usedUnits / $totalUnits) * 100);
    }

    public function isFullyUsed()
    {
        return $this->usage_percentage >= 100;
    }

    /**
     * Scope for filtering active packages (usage < 100%)
     * 
     * Note: This uses a subquery approach to approximate active status.
     * For exact filtering, use: $packages->filter(fn($p) => $p->usage_percentage < 100)
     */
    public function scopeActive($query)
    {
        // A package is considered active if it has at least one unused non-extra service
        // This is an approximation that works for both variant and non-variant packages
        return $query->whereHas('usages', function ($q) {
            $q->whereNull('used_at')
              ->whereHas('service', function ($serviceQuery) {
                  $serviceQuery->where('is_extra', false);
              });
        });
    }

    /**
     * Scope for filtering fully used packages (usage = 100%)
     * 
     * Note: This uses a subquery approach to approximate fully used status.
     * For exact filtering, use: $packages->filter(fn($p) => $p->usage_percentage >= 100)
     */
    public function scopeFullyUsed($query)
    {
        // A package is considered fully used if ALL non-extra regular services are used
        // AND at least one service in each variant group is used
        
        // Simple approach: No unused non-extra services exist
        return $query->whereDoesntHave('usages', function ($q) {
            $q->whereNull('used_at')
              ->whereHas('service', function ($serviceQuery) {
                  $serviceQuery->where('is_extra', false);
              });
        })
        // AND has at least one usage (to exclude empty packages)
        ->whereHas('usages');
    }

    /**
     * Generate unique package_id in format: YYYYMMDD-XX
     * XX is daily counter (01-99)
     */
    public static function generatePackageId(): string
    {
        $date = now()->format('Ymd');  // 20251015

        // Find highest number for today
        $lastPackage = static::where('package_id', 'LIKE', $date . '-%')
            ->orderBy('package_id', 'desc')
            ->first();

        if ($lastPackage) {
            // Extract the counter part (XX) from format YYYYMMDD-XX
            $lastNumber = (int) substr($lastPackage->package_id, -2);
            $nextNumber = $lastNumber + 1;

            // Safety check: max 99 packages per day
            if ($nextNumber > 99) {
                throw new \Exception('Daily package limit reached (99 packages)');
            }
        } else {
            $nextNumber = 1;
        }

        return sprintf('%s-%02d', $date, $nextNumber);
    }

    /**
     * Boot method to auto-generate package_id before creation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($package) {
            if (empty($package->package_id)) {
                $package->package_id = static::generatePackageId();
            }
        });
    }
}
