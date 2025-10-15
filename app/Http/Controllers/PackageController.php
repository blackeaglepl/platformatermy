<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\PackageLog;
use App\Models\PackageService;
use App\Models\PackageServiceUsage;
use App\Services\PackagePdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Get package type name by type number.
     */
    private function getPackageTypeName(int $type): string
    {
        $packageNames = [
            1 => 'Naturalna Harmonia',
            2 => 'Termalna Ulga',
            3 => 'Szept Miłości',
            4 => 'Kobiecy Chill',
            5 => 'Wspólna Regeneracja',
            6 => 'Impreza Urodzinowa',
        ];

        return $packageNames[$type] ?? "Pakiet {$type}";
    }

    /**
     * Display a listing of packages.
     */
    public function index(Request $request)
    {
        $query = Package::with(['creator', 'usages.service'])
            ->latest();

        // Server-side search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('package_id', 'like', "%{$search}%")
                  ->orWhere('custom_id', 'like', "%{$search}%");
            });
        }

        // Server-side status filter using scopes
        if ($status = $request->input('status')) {
            switch ($status) {
                case 'wykorzystane':
                    $query->fullyUsed();
                    break;
                    
                case 'aktywne':
                    $query->active();
                    break;
            }
        }

        // Paginate with 25 items per page
        $packages = $query->paginate(25)
            ->through(function ($package) {
                return [
                    'id' => $package->id,
                    'package_id' => $package->package_id,
                    'owner_name' => $package->custom_id,  // custom_id contains owner name
                    'package_type' => $package->package_type,
                    'package_type_name' => $this->getPackageTypeName($package->package_type),
                    'created_by' => $package->creator->name,
                    'created_at' => $package->created_at->format('Y-m-d H:i'),
                    'usage_percentage' => $package->usage_percentage,
                    'is_fully_used' => $package->isFullyUsed(),
                ];
            });

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new package.
     */
    public function create()
    {
        // Get package types with their services grouped by zone
        $packageTypes = [];
        for ($i = 1; $i <= 6; $i++) {
            $services = DB::table('package_type_services')
                ->join('package_services', 'package_type_services.service_id', '=', 'package_services.id')
                ->where('package_type_services.package_type', $i)
                ->select('package_services.*', 'package_type_services.quantity')
                ->get()
                ->groupBy('zone');

            $packageTypes[$i] = [
                'type' => $i,
                'name' => $this->getPackageTypeName($i),
                'services_by_zone' => $services,
            ];
        }

        return Inertia::render('Packages/Create', [
            'packageTypes' => $packageTypes,
        ]);
    }

    /**
     * Store a newly created package in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_name' => 'required|string|max:255',
            'package_type' => 'required|integer|min:1|max:6',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Create package (package_id is auto-generated in model boot method)
            $package = Package::create([
                'custom_id' => $validated['owner_name'],  // custom_id contains owner name
                'package_type' => $validated['package_type'],
                'created_by' => Auth::id(),
                'notes' => $validated['notes'] ?? null,
            ]);

            // Get services for this package type
            $serviceAssignments = DB::table('package_type_services')
                ->where('package_type', $validated['package_type'])
                ->get();

            // Create usage records for each service (respecting quantity)
            foreach ($serviceAssignments as $assignment) {
                for ($i = 0; $i < $assignment->quantity; $i++) {
                    PackageServiceUsage::create([
                        'package_id' => $package->id,
                        'service_id' => $assignment->service_id,
                        'used_at' => null,
                        'marked_by' => null,
                        'notes' => null,
                    ]);
                }
            }

            DB::commit();

            // Log package creation (non-blocking)
            try {
                PackageLog::logAction(
                    $package->id,
                    'package_created',
                    [
                        'package_type' => $this->getPackageTypeName($validated['package_type']),
                        'owner_name' => $validated['owner_name'],
                    ]
                );
            } catch (\Exception $e) {
                // Log error but don't block package creation
                \Log::error('Failed to log package creation: ' . $e->getMessage());
            }

            return redirect()->route('packages.show', $package->id)
                ->with('success', "Pakiet {$package->package_id} został utworzony pomyślnie!");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Błąd podczas tworzenia pakietu: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified package.
     */
    public function show(Package $package)
    {
        $package->load([
            'creator',
            'usages.service',
            'usages.marker',
            'logs' => function ($query) {
                $query->with('user:id,name')
                      ->latest()
                      ->limit(40);
            }
        ]);

        // Separate regular services and extra services
        $regularUsages = $package->usages->filter(function ($usage) {
            return !$usage->service->is_extra;
        });

        $extraUsages = $package->usages->filter(function ($usage) {
            return $usage->service->is_extra;
        });

        // Group regular usages by zone
        $usagesByZone = $regularUsages->groupBy(function ($usage) {
            return $usage->service->zone;
        });

        return Inertia::render('Packages/Show', [
            'package' => [
                'id' => $package->id,
                'package_id' => $package->package_id,           // Auto-generated ID
                'owner_name' => $package->custom_id,            // custom_id contains owner name
                'package_type' => $package->package_type,
                'package_type_name' => $this->getPackageTypeName($package->package_type),
                'created_by' => $package->creator->name,
                'created_at' => $package->created_at->format('Y-m-d H:i'),
                'usage_percentage' => $package->usage_percentage,
                'is_fully_used' => $package->isFullyUsed(),
                'notes' => $package->notes,
                'usages_by_zone' => [
                    'relaksu' => $usagesByZone->get('relaksu', collect())->map(function ($usage) {
                        return $this->formatUsage($usage);
                    }),
                    'odnowy' => $usagesByZone->get('odnowy', collect())->map(function ($usage) {
                        return $this->formatUsage($usage);
                    }),
                    'smaku' => $usagesByZone->get('smaku', collect())->map(function ($usage) {
                        return $this->formatUsage($usage);
                    }),
                ],
                'extra_usages' => $extraUsages->map(function ($usage) {
                    return $this->formatUsage($usage);
                })->values(),
                'logs' => $package->logs->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'action' => $log->action_description,
                        'user_name' => $log->user->name,
                        'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                        'details' => $log->details,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update package owner name.
     */
    public function updateOwner(Request $request, Package $package)
    {
        $validated = $request->validate([
            'owner_name' => 'required|string|max:255',
        ]);

        $oldOwner = $package->custom_id;

        $package->update([
            'custom_id' => $validated['owner_name'],  // custom_id contains owner name
        ]);

        // Log owner change (non-blocking)
        try {
            PackageLog::logAction(
                $package->id,
                'owner_updated',
                [
                    'old_value' => $oldOwner,
                    'new_value' => $validated['owner_name'],
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Failed to log owner update: ' . $e->getMessage());
        }

        return back()->with('success', 'Posiadacz pakietu został zaktualizowany!');
    }

    /**
     * Update package notes.
     */
    public function updateNotes(Request $request, Package $package)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $package->update([
            'notes' => $validated['notes'] ?? null,
        ]);

        // Log notes update (non-blocking)
        try {
            PackageLog::logAction(
                $package->id,
                'notes_updated'
            );
        } catch (\Exception $e) {
            \Log::error('Failed to log notes update: ' . $e->getMessage());
        }

        return back()->with('success', 'Uwagi zostały zaktualizowane!');
    }

    /**
     * Format usage data for frontend.
     */
    private function formatUsage($usage)
    {
        return [
            'id' => $usage->id,
            'service_name' => $usage->service->name,
            'service_description' => $usage->service->description,
            'service_duration' => $usage->service->duration,
            'is_used' => $usage->used_at !== null,
            'used_at' => $usage->used_at ? $usage->used_at->format('Y-m-d H:i') : null,
            'marked_by' => $usage->marker ? $usage->marker->name : null,
            'notes' => $usage->notes,
        ];
    }

    /**
     * Generate and download PDF for package.
     */
    public function generatePdf(Package $package)
    {
        $pdfService = new PackagePdfService();
        $response = $pdfService->downloadPdf($package);

        // Log PDF generation AFTER successful generation
        try {
            PackageLog::logAction(
                $package->id,
                'pdf_generated'
            );
        } catch (\Exception $e) {
            // Log error but don't block PDF download
            \Log::error('Failed to log PDF generation: ' . $e->getMessage());
        }

        return $response;
    }
}
