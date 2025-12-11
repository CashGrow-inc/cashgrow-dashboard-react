# --- STAGE 1: Build the React Application ---
FROM node:20-alpine AS builder

# Set the working directory for the build stage
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) first
# This allows Docker to use the cached layer if only source code changes
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
# This command runs your build script (e.g., 'react-scripts build' or similar)
# and creates the production-ready static files in the 'dist' (or 'build') directory
# You may need to change 'npm run build' if your project uses a different command.
RUN npm run build

# --- STAGE 2: Serve the Static Files with Nginx ---
FROM nginx:stable-alpine AS final

# Copy a custom Nginx configuration file
# This is optional but recommended to ensure Nginx is configured to handle
# Single Page Applications (SPAs) like React (e.g., for proper routing/history API support).
# Assuming you have a file named 'nginx.conf' in the same directory as your Dockerfile.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build artifacts from the 'builder' stage into the Nginx public directory
# Assuming your build output is in a directory named 'dist'.
# If your build script creates a 'build' directory, change 'dist' to 'build'.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port Nginx is running on (default is 80)
EXPOSE 80

# The default Nginx CMD is sufficient:
# CMD ["nginx", "-g", "daemon off;"]
