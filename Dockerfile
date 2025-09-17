# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all project files
COPY . .

# Expose the port (Back4App sets process.env.PORT automatically)
EXPOSE 4000

# Run the app
CMD ["node", "server.js"]
