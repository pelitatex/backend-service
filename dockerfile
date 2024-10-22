# Use a specific version of the Node.js Alpine image for a smaller image size
FROM node:20.8

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
#RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3301-3304

# Use a non-root user to run the application
USER node

# Command to run the application
CMD ["node", "server.js"]