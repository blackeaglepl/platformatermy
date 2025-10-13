@echo off
echo.
echo ===================================
echo   TermyGorce - Container Logs
echo ===================================
echo.
echo Press Ctrl+C to exit logs view
echo.

call vendor\bin\sail logs -f
