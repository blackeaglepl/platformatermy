@echo off
echo.
echo ===================================
echo   TermyGorce - First Time Setup
echo ===================================
echo.

REM Check if .env exists
if not exist .env (
    echo [1/6] Creating .env file from .env.example...
    copy .env.example .env
) else (
    echo [1/6] .env file already exists, skipping...
)

echo.
echo [2/6] Installing Composer dependencies...
docker run --rm -v "%cd%:/var/www/html" -w /var/www/html laravelsail/php83-composer:latest composer install --ignore-platform-reqs

echo.
echo [3/6] Starting Laravel Sail...
call vendor\bin\sail up -d

echo.
echo [4/6] Generating application key...
call vendor\bin\sail artisan key:generate

echo.
echo [5/6] Running database migrations...
call vendor\bin\sail artisan migrate

echo.
echo [6/6] Installing NPM dependencies...
call npm install

echo.
echo ===================================
echo   Setup Complete!
echo ===================================
echo.
echo To start the project, run:
echo   start.bat
echo.
echo Or use NPM commands:
echo   npm run dev      - Start Vite only
echo   npm start        - Start everything
echo.
pause
