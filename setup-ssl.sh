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

# Update nginx configuration
echo "Updating nginx configuration..."
sudo tee /etc/nginx/conf.d/default.conf > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start nginx
echo "Starting nginx..."
sudo systemctl start nginx

echo -e "${GREEN}SSL setup completed!${NC}"
echo "Your site should now be accessible at https://$DOMAIN" 