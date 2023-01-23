# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

RUN npm install styled-components

# Expose the port for the application to run on
EXPOSE 3000

# Start the application
CMD ["./script.sh"]