@echo off
echo.
echo ===================================
echo   TermyGorce - Stopping Project
echo ===================================
echo.

echo [1/1] Stopping Docker containers...
docker compose down

echo.
echo ===================================
echo   Project stopped successfully!
echo ===================================
echo.
pause
