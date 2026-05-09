FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application
COPY . .

# Build the application
RUN npm run build

# Expose the correct port
EXPOSE 3000

# Start script
CMD ["npm", "start"]
