# server/Dockerfile

# ==========================================
# Stage 1: Build (Dependencies & Generation)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies required for build tools
RUN apk add --no-cache openssl bash

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client (Adapting to your file structure)
RUN npx prisma generate

# ==========================================
# Stage 2: Production (Runtime)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies (OpenSSL 3 and LibPQ are critical for Prisma/Alpine)
RUN apk add --no-cache openssl libssl3 libpq bash

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/src ./src

# Copy the startup automation script
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose the API port
EXPOSE 3001 

# Start using the script
CMD ["start.sh"]