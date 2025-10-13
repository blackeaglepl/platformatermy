<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Alert;
use App\Models\Traffic;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/traffic', function (Request $request) {
    return Traffic::latest()->get()->value('value');
});

Route::get('/alerts', function (Request $request) {
    $alert = Alert::first(); // since there's only one
    if ($alert && $alert->enabled == 1) {
        return [$alert]; // return as array to match original format
    }
    return []; // return empty array otherwise
});
