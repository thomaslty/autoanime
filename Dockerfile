# ---- Stage 1: Build frontend ----
FROM node:24-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Prepare backend ----
FROM node:24-alpine AS backend-setup

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY backend/scripts ./scripts
COPY backend/drizzle ./drizzle
COPY backend/drizzle.config.js ./

# ---- Stage 3: Final image ----
FROM node:24-alpine

RUN apk add --no-cache nginx su-exec shadow

WORKDIR /app

# Copy backend
COPY --from=backend-setup /app/backend ./backend

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create nginx pid/log dirs
RUN mkdir -p /run/nginx /var/log/nginx

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
