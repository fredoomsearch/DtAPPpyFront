# Use a Node.js image to build the Angular app
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /angular-front

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the Angular app code and build it
COPY ./ ./
RUN npm run build --prod

# Use an Nginx image to serve the built files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the frontend
EXPOSE 80