#!/bin/bash
# Deployment script for UMass Marketplace
# Builds and deploys all services to EC2

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ Error: .env file not found in deploy directory"
    echo "   Please copy deploy/env.example to deploy/.env and configure it"
    exit 1
fi

# Load environment variables
set -a
source "$SCRIPT_DIR/.env"
set +a

# Navigate to project root
cd "$PROJECT_ROOT"

# Build and start services with Docker Compose (frontend is built inside the web image)
echo "🐳 Building and starting Docker containers..."
cd "$SCRIPT_DIR"
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check API health
echo "🏥 Checking API health..."
for i in {1..30}; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ API is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API health check failed"
        docker-compose -f docker-compose.prod.yml logs api
        exit 1
    fi
    sleep 2
done

# Check frontend
echo "🌐 Checking frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend may not be ready yet"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 Useful commands:"
echo "  View logs: docker-compose -f deploy/docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f deploy/docker-compose.prod.yml down"
echo "  Restart services: docker-compose -f deploy/docker-compose.prod.yml restart"
