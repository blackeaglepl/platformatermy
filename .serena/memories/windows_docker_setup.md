# Windows + Docker Setup Specifics

## Critical Setup Information

### Problem: Windows ↔ Linux Compatibility
Project is developed on **Windows** but runs in **Linux Docker containers**. This creates specific challenges.

### Solution #1: Named Volume for node_modules
**Problem:** Binary npm packages (rollup, esbuild) are compiled for different operating systems.

**Solution:** In `docker-compose.yml` use **named volume** for `node_modules`:
```yaml
volumes:
    - '.:/var/www/html'
    - 'sail-node-modules:/var/www/html/node_modules'  # CRITICAL!
```

**Effect:**
- Source code syncs from Windows
- `node_modules` lives ONLY in Linux container
- No binary conflicts

### Solution #2: Vite Configuration
**Problem:** Vite must run in container but be accessible from Windows browser.

**Solution:** In `vite.config.js`:
```javascript
server: {
    host: '0.0.0.0',           // Listen on all interfaces (Docker)
    port: 5173,
    strictPort: true,
    hmr: {
        host: 'localhost',      // HMR for Windows browser
    },
    watch: {
        usePolling: true,       // Better file watching from Windows
    },
}
```

### Solution #3: Vite MUST run in container
❌ **DOESN'T WORK:**
```bash
npm run dev  # Run directly on Windows
```

✅ **WORKS:**
```bash
docker exec platformapakiety-laravel.test-1 npm run dev  # In container
```

### Solution #4: Use docker compose instead of sail
**Problem:** Laravel Sail doesn't work well in Git Bash (only PowerShell/CMD/WSL2)

**Solution:** `start.bat` uses `docker compose` directly:
```batch
docker compose up -d                                          # Instead of: vendor\bin\sail up -d
docker exec platformapakiety-laravel.test-1 npm install      # Instead of: sail npm install
docker exec platformapakiety-laravel.test-1 npm run dev      # Instead of: sail npm run dev
```

### File Location Reference
| Element | Location | System |
|---------|----------|--------|
| Source code (.tsx, .php) | `F:\Windsurf\PlatformaPakiety\` | Windows (synced to container) |
| node_modules | Docker volume `sail-node-modules` | Linux (ONLY in container) |
| database.sqlite | `F:\Windsurf\PlatformaPakiety\database\` | Windows (synced to container) |
| vendor/ (Composer) | `F:\Windsurf\PlatformaPakiety\vendor\` | Windows (synced to container) |
| Vite dev server | Runs in container | Linux (port 5173 mapped) |
| Laravel | Runs in container | Linux (port 80 mapped) |

### Common Issues & Solutions

#### Issue: "npm ERR! ENOENT: no such file or directory"
**Solution:** Run npm commands in container:
```bash
docker exec platformapakiety-laravel.test-1 npm install
```

#### Issue: "Vite HMR not working"
**Solution:** Ensure Vite runs in container with correct config

#### Issue: "Permission denied" errors
**Solution:** All Docker commands should be run from host Windows, not inside container for file operations

#### Issue: "Container not found"
**Solution:** Check container name:
```bash
docker ps  # Should show platformapakiety-laravel.test-1
```