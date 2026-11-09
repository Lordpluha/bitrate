# Multi-stage Dockerfile для Mobile (Expo)

# Stage 1: Base
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.7.0
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY scripts ./scripts
COPY apps/mobile/package.json ./apps/mobile/
# pnpm's frozen-lockfile check validates every workspace importer in pnpm-lock.yaml has a
# package.json on disk, not just the ones this app depends on — so every workspace member's
# package.json has to be copied here, even packages this image never installs code from.
COPY apps/admin/package.json ./apps/admin/
COPY apps/api/package.json ./apps/api/
COPY apps/desktop/package.json ./apps/desktop/
COPY apps/docs/package.json ./apps/docs/
COPY apps/web-artists/package.json ./apps/web-artists/
COPY apps/web-player/package.json ./apps/web-player/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/converter/package.json ./packages/converter/
COPY packages/ncs-parser/package.json ./packages/ncs-parser/
COPY packages/player/package.json ./packages/player/
COPY packages/svgr/package.json ./packages/svgr/
COPY packages/tailwind/package.json ./packages/tailwind/
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/vite-svgr/package.json ./packages/vite-svgr/
COPY turbo.json ./
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

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

# Stage 6: CI/CD Build (для Android/iOS сборки в облаке)
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

# Stage 7: Production Web Server (nginx для веб-версии)
# Last stage on purpose: it is the image that ships, so it is the one image scanners judge.
FROM nginx:1.31-alpine AS production-web
# The nginx base is rebuilt upstream only every few weeks, while Alpine ships fixes for its
# packages (curl, brotli, ...) in between; upgrading here keeps the scan clean without
# waiting for a new tag.
RUN apk upgrade --no-cache

# Shared static-site config: unprivileged `nginx` user on port 8080, SPA fallback to index.html.
COPY --from=build --chown=nginx:nginx /app/apps/mobile/dist /usr/share/nginx/html
COPY infra/nginx/static-site.conf /etc/nginx/nginx.conf

USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  # 127.0.0.1, not localhost: wget tries ::1 first and `listen 8080` binds IPv4 only.
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
