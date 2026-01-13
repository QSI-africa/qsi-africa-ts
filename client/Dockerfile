# ==========================================
# Stage 1: Build (React / Vite)
# ==========================================
FROM node:20-slim AS builder
WORKDIR /app

# Enable build-time args for Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the production application
RUN npm run build

# ==========================================
# Stage 2: Runtime (Nginx)
# ==========================================
FROM nginx:stable-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
