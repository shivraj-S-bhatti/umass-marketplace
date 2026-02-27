#!/bin/bash
# Build API and Web images on your Mac and push to Amazon ECR.
# Run from project root: ./deploy/build-and-push.sh
# Then add the printed ECR_URI_* lines to deploy/.env and run deploy.sh on EC2 (no build there).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ deploy/.env not found. Create it from deploy/env.prod.example and set at least VITE_API_BASE_URL and AWS_REGION."
    exit 1
fi

set -a
source "$SCRIPT_DIR/.env"
set +a

VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:8080}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "🔐 Resolving AWS account and logging in to ECR..."
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" || true
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ AWS CLI not configured or no credentials. Run: aws configure"
    exit 1
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

for repo in umass-marketplace-api umass-marketplace-web; do
    if ! aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" &>/dev/null; then
        echo "📦 Creating ECR repository: $repo"
        aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION" --output text --query 'repository.repositoryUri'
    fi
done

echo ""
echo "🐳 Building API image (linux/amd64 for EC2)..."
docker build --platform linux/amd64 -t "${ECR_REGISTRY}/umass-marketplace-api:latest" "$PROJECT_ROOT/api"

echo ""
echo "🐳 Building Web image (linux/amd64, VITE_API_BASE_URL=$VITE_API_BASE_URL)..."
docker build --platform linux/amd64 -t "${ECR_REGISTRY}/umass-marketplace-web:latest" \
    --build-arg "VITE_API_BASE_URL=$VITE_API_BASE_URL" \
    "$PROJECT_ROOT/web"

echo ""
echo "📤 Pushing to ECR..."
docker push "${ECR_REGISTRY}/umass-marketplace-api:latest"
docker push "${ECR_REGISTRY}/umass-marketplace-web:latest"

echo ""
echo "✅ Done. Add these to deploy/.env (and copy .env to EC2) for fast deploy:"
echo ""
echo "ECR_URI_API=${ECR_REGISTRY}/umass-marketplace-api:latest"
echo "ECR_URI_WEB=${ECR_REGISTRY}/umass-marketplace-web:latest"
echo ""
