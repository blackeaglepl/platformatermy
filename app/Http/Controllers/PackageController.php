<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\PackageService;
use App\Models\PackageServiceUsage;
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
                  ->orWhere('owner_name', 'like', "%{$search}%");
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
                    'owner_name' => $package->owner_name,
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
                'owner_name' => $validated['owner_name'],
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
        $package->load(['creator', 'usages.service', 'usages.marker']);

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
                'owner_name' => $package->owner_name,          // Owner/recipient name
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

        $package->update([
            'owner_name' => $validated['owner_name'],
        ]);

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
}
