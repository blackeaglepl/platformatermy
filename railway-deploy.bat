@echo off
echo ========================================
echo Railway Deployment Script
echo ========================================
echo.

REM Sprawdź czy jesteśmy na railway-test branchu
git branch --show-current > temp.txt
set /p CURRENT_BRANCH=<temp.txt
del temp.txt

if NOT "%CURRENT_BRANCH%"=="railway-test" (
    echo ERROR: You are on branch '%CURRENT_BRANCH%'
    echo Please switch to railway-test branch first:
    echo.
    echo   git checkout railway-test
    echo.
    pause
    exit /b 1
)

echo [OK] On railway-test branch
echo.

REM Sprawdź czy Railway CLI jest zainstalowane
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Railway CLI not found. Installing...
    npm install -g @railway/cli
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install Railway CLI
        pause
        exit /b 1
    )
    echo [OK] Railway CLI installed
) else (
    echo [OK] Railway CLI found
)

echo.
echo ========================================
echo Step 1: Login to Railway
echo ========================================
echo This will open your browser for authentication.
echo Press any key to continue...
pause >nul

railway login
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Login failed
    pause
    exit /b 1
)

echo.
echo [OK] Logged in successfully
echo.

echo ========================================
echo Step 2: Initialize or link Railway project
echo ========================================
echo.
echo Choose an option:
echo   1 - Create NEW Railway project
echo   2 - Link to EXISTING Railway project
echo   3 - Skip (already linked)
echo.
set /p CHOICE="Enter choice (1/2/3): "

if "%CHOICE%"=="1" (
    echo.
    echo Creating new Railway project...
    railway init
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create project
        pause
        exit /b 1
    )
)

if "%CHOICE%"=="2" (
    echo.
    echo Linking to existing project...
    railway link
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to link project
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Step 3: Check if MySQL is added
echo ========================================
echo.
echo IMPORTANT: Your project needs a MySQL database!
echo.
echo To add MySQL:
echo   1. Go to https://railway.app
echo   2. Open your project
echo   3. Click "New" -^> "Database" -^> "Add MySQL"
echo.
echo Press any key when MySQL is ready...
pause >nul

echo.
echo ========================================
echo Step 4: Set environment variables
echo ========================================
echo.
echo You need to set these variables in Railway dashboard:
echo.
echo   APP_KEY=base64:...  (generate with: php artisan key:generate --show)
echo   BACKUP_PASSWORD=YourStrongPassword123
echo.
echo Press any key when variables are set...
pause >nul

echo.
echo ========================================
echo Step 5: Deploy to Railway
echo ========================================
echo.
echo Starting deployment...
railway up

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Deployment failed
    echo Check logs with: railway logs
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Deployment completed
echo ========================================
echo.
echo Next steps:
echo   1. Run migrations: railway run php artisan migrate --force
echo   2. Create admin user (see RAILWAY_DEPLOYMENT.md)
echo   3. Open app: railway open
echo.
echo View logs: railway logs
echo.
pause
