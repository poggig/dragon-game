@echo off
cd /d "%~dp0"
echo ============================================
echo   Chronicles of Azurerune v3 - Game Launcher
echo ============================================
echo.
echo Starting local web server...
echo Game will open at: http://localhost:8003/index.html
echo.
echo NOTE: If you see old content, press Ctrl+Shift+R
echo in your browser to force-refresh the cache.
echo.
echo Press Ctrl+C to stop the server when done.
echo.
start http://localhost:8003/index.html
python -m http.server 8003 --bind 127.0.0.1 --directory game_v3
