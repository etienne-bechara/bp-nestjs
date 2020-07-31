# Use smallest current Node.js image
FROM node:14-alpine
EXPOSE 8080

# Create application directory and install packages
WORKDIR /app
COPY package*.json /app/
RUN npm install --only=production

# Copy source code and execute application
COPY . /app
CMD ["node", "source/core/main.js"]
