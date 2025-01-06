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

# Expose port (nếu ứng dụng của bạn chạy trên cổng khác)
EXPOSE 3000

# Command to run the application directly
CMD ["npx", "vite", "preview", "--port", "3000", "--host", "0.0.0.0"]
