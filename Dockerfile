# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend and backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/public ./server/public

# Create data directory for JSON storage
RUN mkdir -p /app/data && chown -R node:node /app/data /app/dist /app/server

# Switch to non-root user
USER node

# Set production environment and port
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

# Start production server
CMD ["npm", "run", "start"]
