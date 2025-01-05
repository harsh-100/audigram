#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to display error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Install required packages
echo "Installing required packages..."
sudo apt-get update && sudo apt-get install -y screen || error_exit "Failed to install screen"

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

# Start backend server in screen
echo "Starting backend server..."
screen -dmS backend bash -c "cd $(pwd) && npm run start"

# Frontend deployment
echo -e "${GREEN}Setting up frontend...${NC}"
cd ../frontend || error_exit "Frontend directory not found"

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install || error_exit "Failed to install frontend dependencies"

# Build frontend
echo "Building frontend..."
npm run build || error_exit "Failed to build frontend"

# Start frontend server in screen
echo "Starting frontend server..."
screen -dmS frontend bash -c "cd $(pwd) && npm run dev"

echo -e "${GREEN}Deployment completed!${NC}"
echo "Backend running on http://localhost:5000"
echo "Frontend running on http://localhost:5173"
echo "To view running servers:"
echo "  screen -r backend"
echo "  screen -r frontend"
echo "To detach from screen: Ctrl+A then D" 