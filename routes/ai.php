<?php

use Laravel\Mcp\Server\Facades\Mcp;

// Register our PlatformaPakiety MCP Server
Mcp::local('pakiety', \App\Mcp\Servers\PlatformaPakietyServer::class); // Start with ./artisan mcp:start pakiety

// Mcp::web('demo', \App\Mcp\Servers\PublicServer::class); // Available at /mcp/demo
// Mcp::local('demo', \App\Mcp\Servers\LocalServer::class); // Start with ./artisan mcp:start demo
