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
FROM nginx:stable-alpine as production-stage

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]