#!/bin/bash
# One-time SSL setup on EC2: host nginx + Certbot for everything-umass.tech.
# Run from EC2 after the Docker stack is up and DNS A record points here.
# Usage: ./deploy/ssl-setup.sh [certbot-email]
#   If email is omitted, certbot will run interactively.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="${SSL_DOMAIN:-everything-umass.tech}"
CERTBOT_EMAIL="${1:-}"

echo "Installing nginx..."
sudo apt-get update -qq
sudo apt-get install -y nginx

echo "Deploying host nginx config for $DOMAIN..."
sudo cp "$SCRIPT_DIR/nginx-host.conf" /etc/nginx/sites-available/umass-marketplace
# Update server_name in place if DOMAIN differs from default
if [ "$DOMAIN" != "everything-umass.tech" ]; then
    sudo sed -i "s/server_name everything-umass.tech/server_name $DOMAIN/" /etc/nginx/sites-available/umass-marketplace
fi
sudo ln -sf /etc/nginx/sites-available/umass-marketplace /etc/nginx/sites-enabled/
# Disable default site if present so it does not bind port 80
sudo rm -f /etc/nginx/sites-enabled/default

echo "Testing nginx config..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Running Certbot for $DOMAIN..."
if [ -n "$CERTBOT_EMAIL" ]; then
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$CERTBOT_EMAIL"
else
    sudo certbot --nginx -d "$DOMAIN"
fi

echo "Done. HTTPS should be live at https://$DOMAIN"
echo "Test renewal with: sudo certbot renew --dry-run"
