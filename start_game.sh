#!/bin/bash
cd "$(dirname "$0")"
echo "============================================"
echo "  Chronicles of Azurerune v3 - Game Launcher"
echo "============================================"
echo ""
echo "Starting local web server..."
echo "Open your browser to: http://localhost:8003/index.html"
echo ""
echo "NOTE: If you see old content, press Ctrl+Shift+R"
echo "in your browser to force-refresh the cache."
echo ""
echo "Press Ctrl+C to stop the server when done."
echo ""

if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8003/index.html" &
elif command -v open &> /dev/null; then
    open "http://localhost:8003/index.html" &
fi

python3 -m http.server 8003 --bind 127.0.0.1 --directory game_v3
