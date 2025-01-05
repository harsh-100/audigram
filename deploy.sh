#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Check for required commands
command_exists node || error_exit "Node.js is not installed"
command_exists npm || error_exit "npm is not installed"

# Function to run a command in a new terminal
run_in_terminal() {
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "$1; exec bash"
    elif command_exists xterm; then
        xterm -e "bash -c '$1; exec bash'" &
    elif command_exists terminal; then
        terminal -e "bash -c '$1; exec bash'" &
    else
        error_exit "No suitable terminal emulator found"
    fi
}

echo -e "${GREEN}Starting deployment...${NC}"

# Backend deployment
echo -e "${GREEN}Setting up backend...${NC}"
cd backend || error_exit "Backend directory not found"

# Install backend dependencies
echo "Installing backend dependencies..."
npm install || error_exit "Failed to install backend dependencies"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate || error_exit "Failed to generate Prisma client"

# Build backend
echo "Building backend..."
npm run build || error_exit "Failed to build backend"

# Start backend server in a new terminal
echo "Starting backend server..."
run_in_terminal "cd $(pwd) && npm run start"

# Frontend deployment
echo -e "${GREEN}Setting up frontend...${NC}"
cd ../frontend || error_exit "Frontend directory not found"

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install || error_exit "Failed to install frontend dependencies"

# Build frontend
echo "Building frontend..."
npm run build || error_exit "Failed to build frontend"

# Start frontend server in a new terminal
echo "Starting frontend server..."
run_in_terminal "cd $(pwd) && npm run dev"

echo -e "${GREEN}Deployment completed!${NC}"
echo "Backend running on http://localhost:5000"
echo "Frontend running on http://localhost:5173"

# Keep the script running
echo "Press Ctrl+C to stop all servers"
wait 