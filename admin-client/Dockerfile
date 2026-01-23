# ==========================================
# Stage 1: Build (React / Vite)
# ==========================================
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build time arguments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the production application
# This generates the 'dist' folder
RUN npm run build

# ==========================================
# Stage 2: Runtime (Nginx)
# ==========================================
FROM nginx:stable-alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config for React routing and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard for HTTP)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]