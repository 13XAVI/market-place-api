FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/app
# Install netcat
RUN apk add --no-cache netcat-openbsd
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["npm", "run", "start:dev"]