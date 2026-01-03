# For production deployment

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY app.db ./app.db

ENV PORT=3000
EXPOSE $PORT

CMD ["node", "dist/server/server.cjs"]