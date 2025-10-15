# Code Style & Conventions

## PHP/Laravel Conventions

### Naming
- **Classes:** PascalCase (`AlertController`, `PackageService`)
- **Methods:** camelCase (`updateAlert`, `markAsUsed`)
- **Variables:** camelCase (`$packageId`, `$isEnabled`)
- **Constants:** SCREAMING_SNAKE_CASE (`ALERT_TYPE_WARNING`)
- **Database tables:** snake_case plural (`alerts`, `package_services`)
- **Database columns:** snake_case (`created_at`, `package_type`)

### File Structure
- **Controllers:** `app/Http/Controllers/`
- **Models:** `app/Models/`
- **Migrations:** `database/migrations/`
- **Enums:** `app/Enums/`

### Code Patterns
- Use Eloquent relationships over raw queries
- Follow Laravel conventions for resource naming
- Use Form Requests for validation
- Prefer explicit return types on methods
- Use Laravel Pint for code formatting

### Comments
- **IMPORTANT:** DO NOT ADD COMMENTS unless explicitly requested
- Keep code self-documenting through good naming
- Use PHPDoc only for complex methods if needed

## TypeScript/React Conventions

### Naming
- **Components:** PascalCase (`UpdateAlertForm.tsx`)
- **Variables/Functions:** camelCase (`isEnabled`, `handleSubmit`)
- **Types/Interfaces:** PascalCase (`AlertType`, `PackageData`)
- **Files:** PascalCase for components, camelCase for utilities

### Component Structure
```typescript
// Props interface
interface ComponentProps {
    prop1: string;
    prop2?: boolean;
}

// Component with explicit typing
export default function ComponentName({ prop1, prop2 = false }: ComponentProps) {
    // Component logic
    return (
        // JSX
    );
}
```

### File Structure
- **Pages:** `resources/js/Pages/`
- **Components:** `resources/js/Components/` or `resources/js/Pages/*/Partials/`
- **Layouts:** `resources/js/Layouts/`
- **Types:** Define inline or in component files

### React Patterns
- Use functional components with hooks
- Prefer TypeScript interfaces over types
- Use Inertia.js forms for data submission
- Follow Tailwind CSS utility-first approach
- Use Headless UI for interactive components

## Database Conventions

### Migrations
- Use descriptive migration names with timestamps
- Always use `up()` and `down()` methods
- Use Laravel schema builder methods
- Never modify existing migrations in production

### Models
- Use singular names for model classes
- Define relationships explicitly
- Use accessor/mutator methods when needed
- Follow Laravel Eloquent conventions

## API Conventions

### Response Format
```json
// Success
{
    "data": [...],
    "message": "Success"
}

// Error
{
    "error": "Error message",
    "code": 400
}
```

### Endpoints
- Use RESTful conventions
- Prefix API routes with `/api/`
- Use resource controllers when possible
- Return consistent JSON responses

## Security Practices
- Never commit secrets or keys
- Use Laravel's built-in security features
- Validate all input data
- Use CSRF protection for forms
- Sanitize output when necessary