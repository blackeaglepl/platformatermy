@echo off
echo.
echo ===================================
echo   TermyGorce - Starting Project (Local Mode)
echo ===================================
echo.

REM Check if database exists
if not exist "database\database.sqlite" (
    echo [INFO] Creating SQLite database...
    type nul > database\database.sqlite
    echo [INFO] Running migrations...
    php artisan migrate --force
)

echo [1/2] Starting Laravel development server...
start "Laravel Server" cmd /k "php artisan serve"

echo.
echo [2/2] Waiting for Laravel to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Vite dev server...
echo.
echo ===================================
echo   Project is running!
echo   Laravel: http://localhost:8000
echo   Vite: http://localhost:5173
echo ===================================
echo.
echo Press Ctrl+C to stop Vite
echo To stop Laravel, close the "Laravel Server" window
echo.

npm run dev
