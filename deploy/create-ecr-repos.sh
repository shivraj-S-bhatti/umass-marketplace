#!/bin/bash
# Create the two ECR repositories via CLI (optional; build-and-push.sh creates them if missing).
# Run from project root: ./deploy/create-ecr-repos.sh
# Requires: aws configure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_REGION="${AWS_REGION:-us-east-1}"
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
  AWS_REGION="${AWS_REGION:-us-east-1}"
fi

echo "🔐 Checking AWS identity..."
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" || true
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ AWS CLI not configured or no credentials. Run: aws configure"
    exit 1
fi

echo "📦 Creating ECR repositories in region $AWS_REGION..."
for repo in umass-marketplace-api umass-marketplace-web; do
    if aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" &>/dev/null; then
        echo "   $repo already exists"
    else
        aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION" --output text --query 'repository.repositoryUri'
        echo "   $repo created"
    fi
done

echo ""
echo "✅ Done. Next: run ./deploy/build-and-push.sh (builds images and pushes to these repos)."
