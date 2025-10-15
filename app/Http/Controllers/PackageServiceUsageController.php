<?php

namespace App\Http\Controllers;

use App\Models\PackageLog;
use App\Models\PackageServiceUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackageServiceUsageController extends Controller
{
    /**
     * Mark a service as used.
     */
    public function markUsed(Request $request, PackageServiceUsage $usage)
    {
        $usage->update([
            'used_at' => now(),
            'marked_by' => Auth::id(),
            'notes' => $request->input('notes'),
        ]);

        return back()->with('success', 'Usługa została oznaczona jako wykorzystana.');
    }

    /**
     * Unmark a service (mark as unused).
     */
    public function unmark(PackageServiceUsage $usage)
    {
        $usage->update([
            'used_at' => null,
            'marked_by' => null,
            'notes' => null,
        ]);

        return back()->with('success', 'Wykorzystanie usługi zostało cofnięte.');
    }

    /**
     * Toggle service usage status.
     */
    public function toggle(PackageServiceUsage $usage)
    {
        // Load service relation for logging
        $usage->load('service');

        if ($usage->used_at) {
            // If used, unmark it
            $usage->update([
                'used_at' => null,
                'marked_by' => null,
                'notes' => null,
            ]);

            // Log the action (non-blocking)
            try {
                PackageLog::logAction(
                    $usage->package_id,
                    $usage->service->is_extra ? 'extra_service_unmarked' : 'service_unmarked',
                    ['service_name' => $usage->service->name]
                );
            } catch (\Exception $e) {
                \Log::error('Failed to log service unmarked: ' . $e->getMessage());
            }

            $message = 'Usługa oznaczona jako niewykorzystana.';
        } else {
            // If not used, mark it
            $usage->update([
                'used_at' => now(),
                'marked_by' => Auth::id(),
            ]);

            // Log the action (non-blocking)
            try {
                PackageLog::logAction(
                    $usage->package_id,
                    $usage->service->is_extra ? 'extra_service_marked' : 'service_marked',
                    ['service_name' => $usage->service->name]
                );
            } catch (\Exception $e) {
                \Log::error('Failed to log service marked: ' . $e->getMessage());
            }

            $message = 'Usługa oznaczona jako wykorzystana.';
        }

        return back()->with('success', $message);
    }
}
