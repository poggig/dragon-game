#!/bin/bash
# Double-click this file on macOS to launch the game
cd "$(dirname "$0")"
echo "Starting Chronicles of Azurerune v3..."
echo "Open browser to: http://localhost:8003/index.html"
echo ""
echo "NOTE: If you see old content, press Cmd+Shift+R"
echo "in your browser to force-refresh the cache."
echo ""
open "http://localhost:8003/index.html"
python3 -m http.server 8003 --bind 127.0.0.1 --directory game_v3
