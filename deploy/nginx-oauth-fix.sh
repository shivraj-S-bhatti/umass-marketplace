#!/usr/bin/env bash
# Add /oauth2/ and /login proxy to API in the existing nginx site config on EC2.
# Run on EC2: sudo bash ~/umass-marketplace/deploy/nginx-oauth-fix.sh

set -e
CONF="/etc/nginx/sites-available/umass-marketplace"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if grep -q "location /oauth2/" "$CONF" 2>/dev/null; then
  echo "OAuth locations already present. No change."
  exit 0
fi

echo "Adding /oauth2/ and /login to $CONF..."
sudo cp "$CONF" "${CONF}.bak.$(date +%Y%m%d%H%M%S)"

# Create temp file with the block to insert
TMPBLOCK=$(mktemp)
cat << 'ENDBLOCK' > "$TMPBLOCK"
    # OAuth2 and login must go to the API (Spring redirects to Google)
    location /oauth2/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location /login {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

ENDBLOCK

# Insert block before the line "    listen 443 ssl;"
awk -v blockfile="$TMPBLOCK" '
  /^[[:space:]]*listen 443 ssl/ && !done {
    while ((getline line < blockfile) > 0) print line
    close(blockfile)
    done = 1
  }
  { print }
' "$CONF" | sudo tee "$CONF.new" > /dev/null
rm -f "$TMPBLOCK"
sudo mv "$CONF.new" "$CONF"

echo "Testing nginx config..."
sudo nginx -t
echo "Reloading nginx..."
sudo systemctl reload nginx
echo "Done. Try Sign in with Google again at https://everything-umass.tech"