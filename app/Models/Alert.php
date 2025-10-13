<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = ['type', 'text', 'enabled', 'order'];
    protected $hidden = ['id', 'created_at', 'updated_at'];
}
