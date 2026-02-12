#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "Starting with UID: $PUID, GID: $PGID"

# Reuse existing group with matching GID, or create a new one
EXISTING_GROUP=$(getent group "$PGID" | cut -d: -f1 || true)
if [ -z "$EXISTING_GROUP" ]; then
  addgroup -g "$PGID" autoanime
  APP_GROUP="autoanime"
else
  APP_GROUP="$EXISTING_GROUP"
fi

# Reuse existing user with matching UID, or create a new one
EXISTING_USER=$(getent passwd "$PUID" | cut -d: -f1 || true)
if [ -z "$EXISTING_USER" ]; then
  adduser -D -u "$PUID" -G "$APP_GROUP" -h /app -s /bin/sh autoanime
  APP_USER="autoanime"
else
  APP_USER="$EXISTING_USER"
  # Ensure user is in the correct group
  addgroup "$APP_USER" "$APP_GROUP" 2>/dev/null || true
fi

echo "Running as user: $APP_USER (UID=$PUID), group: $APP_GROUP (GID=$PGID)"

# Fix ownership of app and runtime directories
chown -R "$PUID:$PGID" /app
chown -R "$PUID:$PGID" /run/nginx /var/log/nginx /var/lib/nginx

# Fix ownership of mounted volumes
[ -d /media ] && chown -R "$PUID:$PGID" /media
[ -d /downloads ] && chown -R "$PUID:$PGID" /downloads

cd /app/backend

echo "Running database migrations..."
node scripts/migrate.js

echo "Starting nginx..."
su-exec "$APP_USER" nginx

echo "Starting backend server..."
exec su-exec "$APP_USER" node src/app.js
