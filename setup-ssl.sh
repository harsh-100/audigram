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

# Stop nginx if running
echo "Stopping nginx..."
sudo systemctl stop nginx

# Install certbot
echo "Installing certbot..."
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx || error_exit "Failed to install certbot"

# Get domain name
DOMAIN="audioshorts.fun"
echo "Setting up SSL for $DOMAIN"

# Generate SSL certificate
echo "Generating SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone -d $DOMAIN || error_exit "Failed to generate SSL certificate"

# Create SSL directory if it doesn't exist
sudo mkdir -p /etc/ssl/private

# Clean up existing nginx configurations
echo "Cleaning up nginx configurations..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/*
sudo rm -f /etc/nginx/conf.d/*

# Update nginx configuration
echo "Updating nginx configuration..."
sudo tee /etc/nginx/conf.d/audioshorts.conf > /dev/null <<EOF
server {
    listen 80;
    server_name audioshorts.fun;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name audioshorts.fun;

    ssl_certificate /etc/letsencrypt/live/audioshorts.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/audioshorts.fun/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo nginx -t || error_exit "Nginx configuration test failed"

# Start nginx
echo "Starting nginx..."
sudo systemctl start nginx

echo -e "${GREEN}SSL setup completed!${NC}"
echo "Your site should now be accessible at https://$DOMAIN" 