# Use Node.js 22 (matches your local version)
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port (HF will map it)
EXPOSE 3000

# Command to run the app
CMD ["node", "scripts/generate-page.js"]