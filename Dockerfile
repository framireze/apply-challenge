# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: producción
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Puerto definido en .env de mi docker-compose
EXPOSE ${PORT} 

CMD ["node", "dist/main"]
