# Backend Dockerfile
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY drizzle.config.js ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"]
