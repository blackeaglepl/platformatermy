<?php

namespace App\Http\Controllers;

use App\Models\PackageLog;
use App\Models\PackageServiceUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
        DB::beginTransaction();

        try {
            // Load service relation for logging
            $usage->load('service');

            // Store original state before update
            $wasUsed = $usage->used_at !== null;

            if ($usage->used_at) {
                // If used, unmark it
                $usage->update([
                    'used_at' => null,
                    'marked_by' => null,
                    'notes' => null,
                ]);

                // Log the action ONLY ONCE (non-blocking + idempotency check)
                try {
                    $actionType = $usage->service->is_extra ? 'extra_service_unmarked' : 'service_unmarked';

                    // Check if this exact action was already logged in the last 2 seconds
                    $recentLog = PackageLog::where('package_id', $usage->package_id)
                        ->where('action_type', $actionType)
                        ->where('created_at', '>', now()->subSeconds(2))
                        ->where('details->service_name', $usage->service->name)
                        ->first();

                    if (!$recentLog) {
                        PackageLog::logAction(
                            $usage->package_id,
                            $actionType,
                            ['service_name' => $usage->service->name]
                        );
                    }
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

                // Log the action ONLY ONCE (non-blocking + idempotency check)
                try {
                    $actionType = $usage->service->is_extra ? 'extra_service_marked' : 'service_marked';

                    // Check if this exact action was already logged in the last 2 seconds
                    $recentLog = PackageLog::where('package_id', $usage->package_id)
                        ->where('action_type', $actionType)
                        ->where('created_at', '>', now()->subSeconds(2))
                        ->where('details->service_name', $usage->service->name)
                        ->first();

                    if (!$recentLog) {
                        PackageLog::logAction(
                            $usage->package_id,
                            $actionType,
                            ['service_name' => $usage->service->name]
                        );
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to log service marked: ' . $e->getMessage());
                }

                $message = 'Usługa oznaczona jako wykorzystana.';
            }

            DB::commit();

            return back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to toggle service usage: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Błąd podczas aktualizacji statusu usługi.']);
        }
    }

    /**
     * Select a variant group (unmark others, mark selected) - ATOMIC operation.
     * This prevents "database is locked" errors from parallel requests.
     */
    public function selectVariant(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|integer|exists:packages,id',
            'variant_group' => 'required|string',
            'service_ids' => 'nullable|array', // nullable allows empty array for unmarking
            'service_ids.*' => 'integer|exists:package_service_usage,id',
        ]);

        // Ensure service_ids is an array (even if null was sent)
        $validated['service_ids'] = $validated['service_ids'] ?? [];

        DB::beginTransaction();

        try {
            $variantGroup = $validated['variant_group'];
            $baseGroup = $variantGroup;

            // Check if it's NOT a person-based variant (osoba1_, osoba2_, etc.)
            if (!preg_match('/^osoba\d+_/', $variantGroup)) {
                // Strip suffix for non-person variants: "odnowa_a" → "odnowa"
                $baseGroup = preg_replace('/_[a-z]$/i', '', $variantGroup);
            }

            // Get ALL services that belong to this base group
            $allVariantServices = PackageServiceUsage::where('package_id', $validated['package_id'])
                ->whereNotNull('variant_group')
                ->where(function ($query) use ($baseGroup) {
                    if (preg_match('/^osoba\d+_/', $baseGroup)) {
                        // Person-based: exact match (osoba1_masaz only)
                        $query->where('variant_group', $baseGroup);
                    } else {
                        // Non-person: match all with same base (odnowa_a, odnowa_b, odnowa_c...)
                        $query->where('variant_group', 'LIKE', $baseGroup . '_%')
                              ->orWhere('variant_group', $baseGroup);
                    }
                })
                ->get();

            // Unmark ALL services in this base group
            foreach ($allVariantServices as $service) {
                $service->update([
                    'used_at' => null,
                    'marked_by' => null,
                    'notes' => null,
                ]);
            }

            // Mark ONLY selected services (if any - empty array means "unmark all")
            if (empty($validated['service_ids'])) {
                // Log unmarking action
                try {
                    PackageLog::logAction(
                        $validated['package_id'],
                        'variant_service_unmarked',
                        [
                            'variant_group' => $validated['variant_group'],
                            'services_count' => $allVariantServices->count(),
                        ]
                    );
                } catch (\Exception $e) {
                    \Log::error('Failed to log variant unmarking: ' . $e->getMessage());
                }
            } else {
                // Mark and log selected services
                foreach ($validated['service_ids'] as $serviceId) {
                    $service = PackageServiceUsage::find($serviceId);
                    if ($service) {
                        $service->update([
                            'used_at' => now(),
                            'marked_by' => Auth::id(),
                        ]);

                        // Log the action (non-blocking)
                        try {
                            PackageLog::logAction(
                                $validated['package_id'],
                                'variant_service_selected',
                                [
                                    'variant_group' => $validated['variant_group'],
                                    'service_name' => $service->service->name ?? 'Unknown',
                                ]
                            );
                        } catch (\Exception $e) {
                            \Log::error('Failed to log variant selection: ' . $e->getMessage());
                        }
                    }
                }
            }

            DB::commit();

            // CRITICAL: Add cache-control headers to prevent stale data
            $package = \App\Models\Package::find($validated['package_id']);
            return redirect()->route('packages.show', $package->id)
                ->with('success', 'Wariant został wybrany!')
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                ->header('Pragma', 'no-cache');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to select variant: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Błąd podczas wyboru wariantu.']);
        }
    }
}
