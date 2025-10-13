<?php

use App\Http\Controllers\ProfileController;
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

Route::get('/packages', function () {
    return Inertia::render('Packages/Index');
})->middleware(['auth', 'verified'])->name('packages.index');

Route::get('/packages/create', function () {
    return Inertia::render('Packages/Create');
})->middleware(['auth', 'verified'])->name('packages.create');

Route::post('/packages', function (Request $request) {
    // TODO: Add validation and store logic
    return Redirect::route('packages.index');
})->middleware(['auth'])->name('packages.store');

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
