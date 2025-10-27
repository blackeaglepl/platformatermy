<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PackageServiceUsageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Alert;
use App\Models\Traffic;

Route::get('/', function () {
    return Redirect::route('login');
    //return Inertia::render('Welcome', [
    //    'canLogin' => Route::has('login'),
    //    'canRegister' => Route::has('register'),
    //    'laravelVersion' => Application::VERSION,
    //    'phpVersion' => PHP_VERSION,
    //]);
});

Route::get('/dashboard', function () {
    // FIXME(md): move to controller
    $traffic = Traffic::first();
    $alert = Alert::first();

    return Inertia::render('Dashboard', [
        'traffic' => $traffic?->value ?? 0, // Default to 0 if no traffic record
        'alertType' => $alert?->type ?? 'INFO', // Default to INFO if no alert
        'alertMessage' => $alert?->text ?? '', // Default to empty string
        'alertEnabled' => (bool) ($alert?->enabled ?? false), // Default to false
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Package routes - with rate limiting (60 requests per minute)
Route::middleware(['auth', 'verified', 'throttle:60,1'])->group(function () {
    Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
    Route::get('/packages/create', [PackageController::class, 'create'])->name('packages.create');
    Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
    Route::get('/packages/{package}', [PackageController::class, 'show'])->name('packages.show');
    Route::get('/packages/{package}/pdf', [PackageController::class, 'generatePdf'])->name('packages.pdf');
    Route::patch('/packages/{package}/owner', [PackageController::class, 'updateOwner'])->name('packages.update-owner');
    Route::patch('/packages/{package}/notes', [PackageController::class, 'updateNotes'])->name('packages.update-notes');
    Route::patch('/packages/{package}/guest-count', [PackageController::class, 'updateGuestCount'])->name('packages.update-guest-count');

    // Service usage routes
    Route::post('/package-usage/{usage}/toggle', [PackageServiceUsageController::class, 'toggle'])->name('package-usage.toggle');
    Route::post('/package-usage/select-variant', [PackageServiceUsageController::class, 'selectVariant'])->name('package-usage.select-variant');
});

Route::patch('/dashboard', function (Request $request) {
    // Security: Validate and sanitize all inputs to prevent XSS and injection attacks

    // Update alert if provided
    if ($request->has('type') || $request->has('text')) {
        $validated = $request->validate([
            'type' => 'required|in:WARNING,PROMO,INFO',
            'text' => 'required|string|max:255',
            'enabled' => 'required|boolean',
        ]);

        // Use updateOrCreate to handle both creating and updating
        Alert::updateOrCreate(
            ['id' => 1], // We use single alert with id=1
            [
                'type' => $validated['type'],
                // Security: Strip HTML tags to prevent XSS (Stored Cross-Site Scripting)
                'text' => strip_tags($validated['text']),
                'enabled' => $validated['enabled'],
                'order' => 1, // Default order
            ]
        );
    }

    // Update traffic if provided
    if ($request->has('value')) {
        $validated = $request->validate([
            'value' => 'required|integer|min:0|max:100',
        ]);

        // Use updateOrCreate to handle both creating and updating
        Traffic::updateOrCreate(
            ['id' => 1], // We use single traffic record with id=1
            ['value' => $validated['value']]
        );
    }

    return Redirect::route('dashboard');
})->middleware(['auth'])->name('dashboard.update');


//Route::middleware('auth')->group(function () {
//    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
//});

require __DIR__.'/auth.php';
