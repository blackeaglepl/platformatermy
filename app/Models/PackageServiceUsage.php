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
        'used_at',
        'marked_by',
        'notes',
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
