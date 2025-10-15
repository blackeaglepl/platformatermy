# Suggested Commands for PlatformaPakiety

## Development Workflow

### Starting the Project
```bash
# Start entire project (Docker + Laravel + Vite)
start.bat

# Alternative: Start containers only
docker compose up -d

# Alternative: Manual start with logs
docker exec platformapakiety-laravel.test-1 npm run dev
```

### Stopping the Project
```bash
# Stop containers
stop.bat
# or
docker compose down
```

### Development Commands (Run in Docker container)
```bash
# Install PHP dependencies
docker exec platformapakiety-laravel.test-1 composer install

# Install Node dependencies  
docker exec platformapakiety-laravel.test-1 npm install

# Run Vite dev server
docker exec platformapakiety-laravel.test-1 npm run dev

# Build for production
docker exec platformapakiety-laravel.test-1 npm run build
```

### Testing
```bash
# Run PHP tests (Pest)
docker exec platformapakiety-laravel.test-1 php artisan test

# Run specific test
docker exec platformapakiety-laravel.test-1 php artisan test --filter=TestName
```

### Code Quality
```bash
# Format PHP code (Laravel Pint)
docker exec platformapakiety-laravel.test-1 ./vendor/bin/pint

# Check PHP code style
docker exec platformapakiety-laravel.test-1 ./vendor/bin/pint --test
```

### Database Operations
```bash
# Run migrations
docker exec platformapakiety-laravel.test-1 php artisan migrate

# Rollback migrations
docker exec platformapakiety-laravel.test-1 php artisan migrate:rollback

# Create new migration
docker exec platformapakiety-laravel.test-1 php artisan make:migration create_example_table

# Seed database
docker exec platformapakiety-laravel.test-1 php artisan db:seed
```

### Laravel Artisan Commands
```bash
# Generate controller
docker exec platformapakiety-laravel.test-1 php artisan make:controller ExampleController

# Generate model
docker exec platformapakiety-laravel.test-1 php artisan make:model Example

# Clear cache
docker exec platformapakiety-laravel.test-1 php artisan cache:clear
docker exec platformapakiety-laravel.test-1 php artisan config:clear
docker exec platformapakiety-laravel.test-1 php artisan route:clear
```

### Windows-specific Commands
```bash
# Check Docker status
docker info

# List running containers
docker ps

# View container logs
docker logs platformapakiety-laravel.test-1

# Kill Vite processes (if needed)
docker exec platformapakiety-laravel.test-1 pkill -f vite
```

## Important URLs
- **Laravel App:** http://localhost
- **Vite Dev Server:** http://localhost:5173 (HMR)

## File Locations
- **Source Code:** `F:\Windsurf\PlatformaPakiety\`
- **Node Modules:** Docker volume `sail-node-modules` (Linux only)
- **Database:** `F:\Windsurf\PlatformaPakiety\database\database.sqlite`