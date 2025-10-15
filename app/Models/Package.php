<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',      // Auto-generated: YYYYMMDD-XX
        'custom_id',       // Contains owner/recipient name
        'package_type',
        'created_by',
        'notes',
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

    public function getUsagePercentageAttribute()
    {
        // Exclude extra services from percentage calculation
        $totalServices = $this->usages()
            ->whereHas('service', function ($query) {
                $query->where('is_extra', false);
            })
            ->count();

        if ($totalServices === 0) {
            return 0;
        }

        $usedServices = $this->usages()
            ->whereHas('service', function ($query) {
                $query->where('is_extra', false);
            })
            ->whereNotNull('used_at')
            ->count();

        return round(($usedServices / $totalServices) * 100);
    }

    public function isFullyUsed()
    {
        return $this->usage_percentage >= 100;
    }

    /**
     * Scope for filtering active packages (usage < 100%)
     */
    public function scopeActive($query)
    {
        return $query->whereHas('usages', function ($q) {
            $q->whereNull('used_at');
        });
    }

    /**
     * Scope for filtering fully used packages (usage = 100%)
     */
    public function scopeFullyUsed($query)
    {
        return $query->whereDoesntHave('usages', function ($q) {
            $q->whereNull('used_at');
        });
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
