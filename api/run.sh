#!/usr/bin/env bash
# Run the API with env vars from .env (so GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are set).
# Usage: ./run.sh   (from api/ directory)
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
exec mvn spring-boot:run
