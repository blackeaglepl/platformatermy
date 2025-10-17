<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Alert;
use App\Models\Traffic;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

/**
 * Public API for Astro Website
 *
 * IMPORTANT: NO rate limiting on these endpoints!
 *
 * Reason:
 * - Consumed by public website (potentially hundreds of visitors per minute)
 * - Reverse proxy (CloudFlare/Nginx) makes all requests appear from 1 IP
 * - Rate limiting would block legitimate users during high traffic (weekends)
 * - Returns minimal data (1 integer + 1 small JSON object)
 * - No sensitive data exposed (public by design)
 *
 * DoS Protection:
 * - CORS restricts origins (config/cors.php)
 * - CloudFlare/server firewall handles malicious traffic
 * - Laravel query caching minimizes DB load
 * - Astro SSG/SSR caching reduces API calls
 *
 * Security Note:
 * - Admin panel IS protected with rate limiting (routes/web.php:40)
 * - These endpoints are intentionally public (per CLAUDE.md design)
 */
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
