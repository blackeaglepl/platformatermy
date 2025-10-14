<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageService extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'zone',
        'description',
        'duration',
        'is_extra',
    ];

    protected $casts = [
        'is_extra' => 'boolean',
    ];
}
