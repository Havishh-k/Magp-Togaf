# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json* ./
RUN npm install

# Build the application
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
