@echo off
echo ========================================
echo Generating Laravel APP_KEY for Railway
echo ========================================
echo.

REM Sprawdź czy kontener działa
docker ps | findstr "platformapakiety-laravel.test-1" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Laravel container not running!
    echo.
    echo Start containers first:
    echo   docker compose up -d
    echo.
    pause
    exit /b 1
)

echo Generating APP_KEY...
echo.

docker exec platformapakiety-laravel.test-1 php artisan key:generate --show

echo.
echo ========================================
echo Copy the key above (including 'base64:' prefix)
echo and paste it into Railway dashboard:
echo.
echo   1. Go to https://railway.app
echo   2. Open your project
echo   3. Click on your service (not MySQL)
echo   4. Go to "Variables" tab
echo   5. Add variable: APP_KEY = [paste here]
echo ========================================
echo.
pause
