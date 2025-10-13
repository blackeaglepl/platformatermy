<?php

namespace App\Http\Controllers;

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
        if ($usage->used_at) {
            // If used, unmark it
            $usage->update([
                'used_at' => null,
                'marked_by' => null,
                'notes' => null,
            ]);
            $message = 'Usługa oznaczona jako niewykorzystana.';
        } else {
            // If not used, mark it
            $usage->update([
                'used_at' => now(),
                'marked_by' => Auth::id(),
            ]);
            $message = 'Usługa oznaczona jako wykorzystana.';
        }

        return back()->with('success', $message);
    }
}
