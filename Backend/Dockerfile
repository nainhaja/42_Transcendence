# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Prisma CLI
RUN npm install -g prisma

# Install dependencies
RUN npm install


# Copy application source code
COPY . .

# Expose the port for the application to run on
EXPOSE 5000

# Start the application
CMD ["./script.sh"]