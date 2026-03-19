@echo off
echo ============================================
echo   Chronicles of Azurerune - Game Launcher
echo ============================================
echo.
echo Starting local web server...
echo Game will open at: http://localhost:8000/index.html
echo.
echo NOTE: If you see old sprites, press Ctrl+Shift+R
echo in your browser to force-refresh the cache.
echo.
echo Press Ctrl+C to stop the server when done.
echo.
start http://localhost:8000/index.html
python -m http.server 8000 --bind 127.0.0.1
