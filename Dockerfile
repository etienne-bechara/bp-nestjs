# Use alpine current Node.js image
FROM node:14-alpine

# Create application directory and install packages
WORKDIR /app
COPY package*.json /app/
RUN npm install --only=production

# Copy source code and execute application
COPY . /app
CMD ["npm", "run", "start:dist"]
