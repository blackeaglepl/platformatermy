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

echo [1/3] Starting Laravel Sail containers...
call vendor\bin\sail up -d

echo.
echo [2/3] Waiting for containers to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Vite dev server...
echo.
echo ===================================
echo   Project is starting!
echo   Laravel: http://localhost
echo   Vite: http://localhost:5173
echo ===================================
echo.
echo Press Ctrl+C to stop Vite (containers will keep running)
echo.

npm run dev
