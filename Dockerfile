FROM node:18-alpine AS build

WORKDIR /angular-front

COPY package.json package-lock.json ./
RUN npm install

COPY ./ ./
RUN npm run build --prod

FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

# Copy the actual build output to /app
COPY --from=build /angular-front/dist/angular-front/browser ./

EXPOSE 80

CMD ["http-server", "-p", "80"]