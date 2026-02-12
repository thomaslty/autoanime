#!/bin/sh
set -e

cd /app/backend

echo "Running database migrations..."
node scripts/migrate.js

echo "Starting nginx..."
nginx

echo "Starting backend server..."
exec node src/app.js
