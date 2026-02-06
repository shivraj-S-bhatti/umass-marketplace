#!/bin/bash
# EC2 Initial Setup Script
# Run this once on a fresh EC2 instance to prepare for deployment

set -e

echo "🚀 Starting EC2 setup for UMass Marketplace..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Install AWS CLI (for S3 operations)
echo "☁️ Installing AWS CLI..."
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    echo "✅ AWS CLI installed"
else
    echo "✅ AWS CLI already installed"
fi

# Install certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# Install curl for health checks
sudo apt-get install -y curl

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p ~/umass-marketplace
cd ~/umass-marketplace

# Create .env file template
if [ ! -f .env ]; then
    echo "📝 Creating .env template..."
    cat > .env << EOF
# Database Configuration
POSTGRES_DB=umarket
POSTGRES_USER=umarket
POSTGRES_PASSWORD=CHANGE_ME

# AWS S3 Configuration
AWS_S3_ENABLED=true
AWS_S3_BUCKET_NAME=umass-marketplace-images
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=CHANGE_ME
AWS_SECRET_ACCESS_KEY=CHANGE_ME

# Image Compression
IMAGE_MAX_WIDTH=1200
IMAGE_MAX_HEIGHT=1200
IMAGE_QUALITY=0.85
IMAGE_MAX_SIZE_KB=100

# Listing Retention (days)
LISTING_RETENTION_DAYS=14

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=CHANGE_ME

# OAuth2 (Google)
GOOGLE_CLIENT_ID=CHANGE_ME
GOOGLE_CLIENT_SECRET=CHANGE_ME

# Frontend URL
FRONTEND_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com
EOF
    echo "✅ .env template created - PLEASE EDIT WITH YOUR VALUES"
fi

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw --force enable

# Create systemd service for auto-start (optional)
echo "⚙️ Setting up auto-start..."
sudo tee /etc/systemd/system/umass-marketplace.service > /dev/null << EOF
[Unit]
Description=UMass Marketplace Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$HOME/umass-marketplace
ExecStart=/usr/local/bin/docker-compose -f deploy/docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f deploy/docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit ~/umass-marketplace/.env with your configuration"
echo "2. Clone your repository: git clone <your-repo-url> ~/umass-marketplace"
echo "3. Run deployment: ./deploy/deploy.sh"
echo ""
echo "⚠️  IMPORTANT: Log out and back in for Docker group changes to take effect"
