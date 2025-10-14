<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PackageServiceUsageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
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
    $traffic = Traffic::latest()->get()->value('value');
    $alert = Alert::latest()->get();
    $alertType = $alert->value('type');
    $alertMessage = $alert->value('text');
    $alertEnabled = (bool) $alert->value('enabled');

    return Inertia::render('Dashboard', [
        'traffic' => $traffic,
        'alertType' => $alertType,
        'alertMessage' => $alertMessage,
        'alertEnabled' => $alertEnabled,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Package routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
    Route::get('/packages/create', [PackageController::class, 'create'])->name('packages.create');
    Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
    Route::get('/packages/{package}', [PackageController::class, 'show'])->name('packages.show');
    Route::patch('/packages/{package}/notes', [PackageController::class, 'updateNotes'])->name('packages.update-notes');

    // Service usage routes
    Route::post('/package-usage/{usage}/toggle', [PackageServiceUsageController::class, 'toggle'])->name('package-usage.toggle');
});

Route::patch('/dashboard', function (Request $request) {
    if ($request->type || $request->text) {
        $alert = Alert::first();
        $alert->type = $request->type;
        $alert->text = $request->text;
        $alert->enabled = $request->enabled;
        $alert->save();
    }

    if ($request->value) {
        $traffic = Traffic::first();
        $traffic->value = $request->value;
        $traffic->save();
    }

    return Redirect::route('dashboard');
})->middleware(['auth'])->name('dashboard.update');


//Route::middleware('auth')->group(function () {
//    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
//});

require __DIR__.'/auth.php';
