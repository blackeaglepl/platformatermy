# Task Completion Checklist

## What to do when a task is completed

### 1. Code Quality Checks
```bash
# Format PHP code with Laravel Pint
docker exec platformapakiety-laravel.test-1 ./vendor/bin/pint

# Run PHP tests (Pest)
docker exec platformapakiety-laravel.test-1 php artisan test

# Build TypeScript/React (check for errors)
docker exec platformapakiety-laravel.test-1 npm run build
```

### 2. Manual Testing
- Test the feature in browser at http://localhost
- Verify API endpoints work correctly (especially /api/traffic and /api/alerts)
- Check responsive design on different screen sizes
- Test authentication flows if touched

### 3. Database Checks
- Verify migrations run successfully
- Check that database relationships work
- Ensure no data corruption

### 4. Documentation Updates
- Update CLAUDE.md if architectural changes were made
- Update task.md with completed tasks
- Add comments to complex code (only if requested)

### 5. Git Workflow
- Stage changes: `git add .`
- Commit with descriptive message
- NEVER commit unless explicitly asked by user

### 6. Critical Validations
⚠️ **NEVER BREAK THESE:**
- API endpoints `/api/traffic` and `/api/alerts` must remain unchanged
- Response format for Astro website must stay the same
- Existing database tables `alerts` and `traffic` must not be modified
- Existing migrations must not be altered

### 7. Performance Checks
- Ensure no N+1 queries in new code
- Verify API responses are fast
- Check that Vite build completes without warnings