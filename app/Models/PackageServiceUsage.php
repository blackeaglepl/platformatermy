<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageServiceUsage extends Model
{
    use HasFactory;

    protected $table = 'package_service_usage';

    protected $fillable = [
        'package_id',
        'service_id',
        'variant_group',
        'instance_number',
        'used_at',
        'marked_by',
        'notes',
        'is_visible',
    ];

    protected $casts = [
        'used_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function service()
    {
        return $this->belongsTo(PackageService::class);
    }

    public function marker()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
