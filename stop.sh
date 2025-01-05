#!/bin/bash

# Kill processes running on the development ports
echo "Stopping frontend server..."
kill $(lsof -t -i:5173) 2>/dev/null || echo "Frontend server not running"

echo "Stopping backend server..."
kill $(lsof -t -i:5000) 2>/dev/null || echo "Backend server not running"

echo "All servers stopped" 