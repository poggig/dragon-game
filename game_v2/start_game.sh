#!/bin/bash
echo "============================================"
echo "  Chronicles of Azurerune - Game Launcher"
echo "============================================"
echo ""
echo "Starting local web server..."
echo "Open your browser to: http://localhost:8000/index.html"
echo ""
echo "NOTE: If you see old sprites, press Ctrl+Shift+R"
echo "in your browser to force-refresh the cache."
echo ""
echo "Press Ctrl+C to stop the server when done."
echo ""

# Try to open browser automatically
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8000/index.html" &
elif command -v open &> /dev/null; then
    open "http://localhost:8000/index.html" &
fi

python3 -m http.server 8000 --bind 127.0.0.1
