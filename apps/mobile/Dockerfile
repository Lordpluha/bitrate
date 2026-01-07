# Multi-stage Dockerfile для Mobile (Expo)

# Stage 1: Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/mobile/package.json ./apps/mobile/
COPY turbo.json ./
RUN pnpm install --frozen-lockfile

# Stage 3: Development (Expo Development Server)
FROM base AS development

# Установка Expo CLI глобально
RUN npm install -g expo-cli @expo/ngrok eas-cli

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/mobile

# Expo порты
# 8081 - Metro bundler
# 19000 - Expo DevTools
# 19001 - Expo DevTools (metro)
# 19002 - Expo DevTools (web)
EXPOSE 8081 19000 19001 19002

# Переменные окружения для Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

CMD ["pnpm", "run", "start"]

# Stage 4: Expo Web Build (для веб-версии)
FROM base AS web-development

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/mobile

EXPOSE 8081
CMD ["pnpm", "run", "web"]

# Stage 5: Build для production
FROM base AS build

# Установка Expo CLI
RUN npm install -g expo-cli eas-cli

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/mobile

# Экспорт статического веб-приложения
RUN pnpm run export

# Stage 6: Production Web Server (nginx для веб-версии)
FROM nginx:alpine AS production-web

# Копируем статические файлы
COPY --from=build /app/apps/mobile/dist /usr/share/nginx/html

# Кастомная nginx конфигурация для SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Stage 7: CI/CD Build (для Android/iOS сборки в облаке)
FROM base AS ci-build

# Установка зависимостей для Android SDK (опционально)
RUN apk add --no-cache \
    openjdk11 \
    git \
    bash

# Установка Expo и EAS CLI
RUN npm install -g expo-cli eas-cli

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/mobile

# Для сборки через EAS Build
CMD ["eas", "build", "--platform", "all"]
