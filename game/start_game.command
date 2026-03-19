#!/bin/bash
# Double-click this file on macOS to launch the game
cd "$(dirname "$0")"
echo "Starting Chronicles of Azurerune..."
echo "Open browser to: http://localhost:8000/index.html"
echo ""
echo "NOTE: If you see old sprites, press Cmd+Shift+R"
echo "in your browser to force-refresh the cache."
echo ""
open "http://localhost:8000/index.html"
python3 -m http.server 8000 --bind 127.0.0.1
