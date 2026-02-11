#!/bin/bash

# Define the compose files to avoid repetition
COMPOSE_FILES="-f docker-compose.dev.yml"

echo "🚀 Starting fresh development build..."

# 1. Build the images without cache
# We use 'build' separately because 'up' doesn't support --no-cache
if docker compose $COMPOSE_FILES build --no-cache; then
    echo "✅ Build successful. Starting containers..."
    
    # 2. Bring the services up
    # --force-recreate ensures containers are replaced even if config hasn't changed
    # --remove-orphans cleans up containers not defined in the current compose files
    docker compose $COMPOSE_FILES up --force-recreate --remove-orphans
else
    echo "❌ Build failed. Check the logs above."
    exit 1
fi