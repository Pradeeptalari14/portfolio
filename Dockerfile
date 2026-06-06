# ==========================================
# Stage 1: Build environment
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using clean install
COPY package*.json ./
RUN npm ci

# Copy codebase and compile production bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production environment
# ==========================================
FROM nginx:1.25-alpine

# Copy built static files to default nginx html path
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom production Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Support non-root execution
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Expose HTTP port
EXPOSE 8080

USER nginx

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
