<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageLog extends Model
{
    const UPDATED_AT = null; // Only track created_at

    protected $fillable = [
        'package_id',
        'user_id',
        'action_type',
        'details',
        'ip_address',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the package that this log belongs to.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper method to log an action.
     */
    public static function logAction(
        int $packageId,
        string $actionType,
        ?array $details = null
    ): void {
        self::create([
            'package_id' => $packageId,
            'user_id' => auth()->id(),
            'action_type' => $actionType,
            'details' => $details,
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Get human-readable action description.
     */
    public function getActionDescriptionAttribute(): string
    {
        return match($this->action_type) {
            'package_created' => 'Utworzono pakiet',
            'service_marked' => "Zaznaczono usługę: {$this->details['service_name']}",
            'service_unmarked' => "Odznaczono usługę: {$this->details['service_name']}",
            'extra_service_marked' => "Zaznaczono usługę dodatkową: {$this->details['service_name']}",
            'extra_service_unmarked' => "Odznaczono usługę dodatkową: {$this->details['service_name']}",
            'pdf_generated' => 'Wygenerowano PDF',
            'owner_updated' => "Zmieniono posiadacza z '{$this->details['old_value']}' na '{$this->details['new_value']}'",
            'notes_updated' => 'Zaktualizowano uwagi',
            default => 'Nieznana akcja',
        };
    }
}
