<?php

namespace App\Mcp\Servers;

use Laravel\Mcp\Server;

class PlatformaPakietyServer extends Server
{
    public string $serverName = 'Platforma Pakiety Server';

    public string $serverVersion = '0.0.1';

    public string $instructions = 'MCP server for PlatformaPakiety - Laravel admin panel for TermyGórce. Provides tools to manage alerts, traffic data, and packages.';

    public array $tools = [
        \App\Mcp\Tools\GetAlertsTool::class,
    ];

    public array $resources = [
        // ExampleResource::class,
    ];

    public array $prompts = [
        // ExamplePrompt::class,
    ];
}
