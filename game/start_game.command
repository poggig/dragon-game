#!/bin/bash
# Double-click this file on macOS to launch the game
cd "$(dirname "$0")"
echo "Starting Chronicles of Azurerune..."
echo "Open browser to: http://localhost:8000"
open http://localhost:8000
python3 -m http.server 8000
