FROM node:18-alpine

WORKDIR /app

# Copy package requirements
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application files
COPY . .

# Hugging Face Spaces default port is 7860
ENV PORT=7860
EXPOSE 7860

# Command to start API server
CMD ["node", "index.js"]
