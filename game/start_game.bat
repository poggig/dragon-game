@echo off
echo ============================================
echo   Chronicles of Azurerune - Game Launcher
echo ============================================
echo.
echo Starting local web server...
echo Game will open at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when done.
echo.
start http://localhost:8000
python -m http.server 8000
