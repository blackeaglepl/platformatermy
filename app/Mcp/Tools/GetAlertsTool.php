<?php

namespace App\Mcp\Tools;

use App\Models\Alert;
use Generator;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\Title;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

#[Title('Get Alerts')]
class GetAlertsTool extends Tool
{
    /**
     * Get all alerts from the database.
     */
    public function description(): string
    {
        return 'Retrieve all alerts from the database with their status, text, type, and order.';
    }

    /**
     * The input schema of the tool.
     */
    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        // No parameters needed for this tool
        return $schema;
    }

    /**
     * Execute the tool call.
     *
     * @return ToolResult|Generator
     */
    public function handle(array $arguments): ToolResult|Generator
    {
        $alerts = Alert::all();
        
        if ($alerts->isEmpty()) {
            return ToolResult::text('No alerts found in the database.');
        }

        $alertData = $alerts->map(function ($alert) {
            return [
                'id' => $alert->id,
                'enabled' => $alert->enabled,
                'text' => $alert->text,
                'type' => $alert->type,
                'order' => $alert->order,
                'created_at' => $alert->created_at,
                'updated_at' => $alert->updated_at,
            ];
        });

        return ToolResult::json($alertData->toArray());
    }
}
