# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies with cache
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Production stage
FROM node:18-alpine as production-stage

WORKDIR /app

# Copy built files and node_modules from build stage
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/vite.config.ts ./

# Expose port (nếu ứng dụng của bạn chạy trên cổng khác)
EXPOSE 3000

# Command to run the application directly
CMD ["npx", "vite", "preview", "--port", "3000", "--host", "0.0.0.0"]

# ================================
# ------- Base Khi Build Image ------- //

# # Stage 1: Build image
# FROM node:20-alpine as BUILD_IMAGE
# WORKDIR /app
# # Copy package.json và lockfile trước để tối ưu cache layer Docker
# COPY package*.json ./
# COPY project.inlang/ ./project.inlang/
# # Cài đặt các dependencies mà không audit
# RUN npm ci --no-audit

# ------------------------------------- //

# FROM linhtran2023/base-image-ui-duc-anh:v03 as BUILD_IMAGE

# # Copy toàn bộ mã nguồn dự án
# COPY . .

# # Thiết lập biến môi trường để tránh lỗi EMFILE
# ENV CHOKIDAR_USEPOLLING=true
# ENV NODE_OPTIONS="--max-old-space-size=2048"

# # Copy file môi trường sản phẩm
# COPY .env.prod ./.env

# # Build ứng dụng
# RUN npm run build

# # Stage 2: Production image
# FROM nginx:1.27.2-alpine-slim as PRODUCTION_IMAGE

# WORKDIR /app

# # Copy build output từ stage BUILD_IMAGE
# COPY --from=BUILD_IMAGE /app/dist/ /app/dist/

# # Copy cấu hình Nginx
# COPY nginx.conf /etc/nginx/conf.d

# # Expose cổng 3000
# EXPOSE 3000

# CMD ["nginx", "-g", "daemon off;"]
