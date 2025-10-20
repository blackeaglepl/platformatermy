@echo off
echo.
echo ===================================
echo   TermyGorce - Starting Project
echo ===================================
echo.

REM Check if Docker Desktop is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/6] Starting Laravel Sail containers...
docker compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo [2/6] Waiting for containers to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [3/6] Checking npm dependencies...
docker exec platformapakiety-laravel.test-1 bash -c "[ -d node_modules ] && echo 'Dependencies OK - skipping npm install' || npm install --prefer-offline"

echo.
echo [4/6] Fixing database permissions...
docker exec platformapakiety-laravel.test-1 bash -c "chmod 664 /var/www/html/database/database.sqlite 2>/dev/null && chmod 775 /var/www/html/database 2>/dev/null && chown -R sail:sail /var/www/html/database 2>/dev/null" >nul 2>&1
echo Database permissions fixed

echo.
echo [5/6] Stopping any existing Vite processes...
docker exec platformapakiety-laravel.test-1 pkill -f vite 2>nul || echo No existing Vite found

echo.
echo [6/6] Starting Vite dev server...
timeout /t 2 /nobreak >nul

REM Start Vite in detached mode
start "Vite Dev Server" docker exec platformapakiety-laravel.test-1 npm run dev

echo.
echo ===================================
echo   Project is STARTING!
echo ===================================
echo.
echo Waiting for Vite to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo ===================================
echo   Project is READY!
echo   Laravel: http://localhost
echo   Open http://localhost in your browser
echo ===================================
echo.
echo IMPORTANT:
echo - A new window opened with Vite logs
echo - Close that window to stop Vite
echo - To stop containers: run stop.bat
echo.
pause
