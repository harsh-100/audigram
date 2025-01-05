#!/bin/bash

# Kill screen sessions
screen -X -S backend quit
screen -X -S frontend quit

# Kill any remaining processes on ports
pkill -f "node.*start"
pkill -f "node.*dev"

echo "All servers stopped" 