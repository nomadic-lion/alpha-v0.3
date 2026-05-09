FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy full application
COPY . .

# Set environment
ENV NODE_ENV=production

# Build the application (client)
RUN npm run build

# Expose the correct port
EXPOSE 3000

# Start script
CMD ["npm", "start"]
