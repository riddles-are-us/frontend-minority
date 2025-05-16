#!/bin/bash

# Set environment variables for better hot reloading in WSL
export PORT=3001
export BROWSER=none
export WDS_SOCKET_HOST=127.0.0.1
export FAST_REFRESH=true
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true
export REACT_APP_DISABLE_LIVE_RELOAD=false

# Kill any existing process on port 3001
echo "Checking for processes on port 3001..."
kill $(lsof -t -i:3001) 2>/dev/null || true

# Clear node_modules/.cache to ensure clean build
echo "Clearing cache..."
rm -rf node_modules/.cache

# Start the development server
echo "Starting development server..."
npx react-app-rewired start 