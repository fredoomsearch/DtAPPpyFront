# Use a Node.js image to build the Angular app
FROM node:18-alpine AS build

WORKDIR /angular-front

COPY package.json package-lock.json ./
RUN npm install

COPY ./ ./
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /angular-front/dist/angular-front /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80