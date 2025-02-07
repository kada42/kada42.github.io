# Use an official lightweight web server image
FROM nginx:alpine

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy public directory into nginx html directory
COPY public/ ./

# Expose port 80 to the outside
EXPOSE 80

# Start nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
