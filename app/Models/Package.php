<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'package_type',
        'created_by',
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

    public function getUsagePercentageAttribute()
    {
        $totalServices = $this->usages()->count();
        if ($totalServices === 0) {
            return 0;
        }

        $usedServices = $this->usages()->whereNotNull('used_at')->count();
        return round(($usedServices / $totalServices) * 100);
    }

    public function isFullyUsed()
    {
        return $this->usage_percentage === 100;
    }
}
