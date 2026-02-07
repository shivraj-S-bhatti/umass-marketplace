#!/bin/bash
# Deployment script for UMass Marketplace
# Builds and deploys all services to EC2 (or locally for testing)
# Writes deploy/deploy.log so you have visibility even if the terminal is lost.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="${SCRIPT_DIR}/deploy.log"

log_step() {
    local step="$1" extra="${2:-}"
    local line="{\"t\":\"$(date -Iseconds)\",\"step\":\"$step\"$extra}"
    echo "$line" >> "$LOG_FILE"
}

log_diagnostics() {
    {
        echo ""
        echo "--- docker ps -a ---"
        docker-compose -f "$SCRIPT_DIR/$COMPOSE_FILE" ps -a
        echo ""
        echo "--- docker compose logs (last 100 lines) ---"
        docker-compose -f "$SCRIPT_DIR/$COMPOSE_FILE" logs --tail=100
    } >> "$LOG_FILE" 2>&1
}

echo "🚀 Starting deployment..."
log_step "deploy_start"

# Check if .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ Error: .env file not found in deploy directory"
    echo "   Please copy deploy/env.example to deploy/.env and configure it"
    log_step "error" ",\"message\":\"env file not found\""
    exit 1
fi

# Load environment variables
set -a
source "$SCRIPT_DIR/.env"
set +a

# ECR only: require pre-built images (no on-host build)
COMPOSE_FILE="docker-compose.ecr.yml"
if [ -z "$ECR_URI_API" ] || [ -z "$ECR_URI_WEB" ]; then
    echo "❌ Error: ECR_URI_API and ECR_URI_WEB must be set in deploy/.env"
    echo "   Run ./deploy/build-and-push.sh on your Mac, then add the printed lines to deploy/.env"
    log_step "error" ",\"message\":\"ECR_URI_API or ECR_URI_WEB missing\""
    exit 1
fi
echo "📦 Using pre-built ECR images (no build)."

# Navigate to project root then deploy dir
cd "$PROJECT_ROOT"
cd "$SCRIPT_DIR"

docker-compose -f "$COMPOSE_FILE" down

echo "🐳 Logging in to ECR and pulling images..."
log_step "pull_start"
ECR_REGISTRY="${ECR_URI_API%%/*}"
aws ecr get-login-password --region "${AWS_REGION:-us-east-1}" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker-compose -f "$COMPOSE_FILE" pull
log_step "pull_end"

# Start services
echo "🐳 Starting containers..."
log_step "up_start"
docker-compose -f "$COMPOSE_FILE" up -d
log_step "up_end"

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check API health
echo "🏥 Checking API health..."
HEALTH_OK=0
for i in {1..30}; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ API is healthy"
        HEALTH_OK=1
        log_step "health_check" ",\"api\":\"ok\""
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API health check failed"
        log_step "health_check" ",\"api\":\"failed\""
        log_diagnostics
        docker-compose -f "$COMPOSE_FILE" logs api
        exit 1
    fi
    sleep 2
done

# Check frontend (web container on 5173; host 80 is used by host nginx after ssl-setup.sh)
echo "🌐 Checking frontend..."
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
    log_step "frontend_check" ",\"frontend\":\"ok\""
else
    echo "⚠️  Frontend may not be ready yet"
    log_step "frontend_check" ",\"frontend\":\"fail\""
fi

log_step "deploy_complete"
log_diagnostics

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service status:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "📝 Visibility: deploy/deploy.log was updated (build/up/health + docker ps and logs)."
echo "📝 Useful commands:"
echo "  View logs: docker-compose -f deploy/$COMPOSE_FILE logs -f"
echo "  Stop services: docker-compose -f deploy/$COMPOSE_FILE down"
echo "  Restart services: docker-compose -f deploy/$COMPOSE_FILE restart"
