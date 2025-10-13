@echo off
echo.
echo ===================================
echo   TermyGorce - Stopping Project
echo ===================================
echo.

echo [1/1] Stopping Laravel Sail containers...
call vendor\bin\sail down

echo.
echo [DONE] All containers stopped!
echo.
pause
