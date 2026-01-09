# Multi-stage Dockerfile для Desktop (Tauri)
# Используется в основном для CI/CD и кросс-компиляции

# Stage 1: Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Dependencies (Node.js)
FROM base AS node-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/desktop/package.json ./apps/desktop/
COPY turbo.json ./
RUN pnpm install --frozen-lockfile

# Stage 3: Rust Build Environment (для production сборки)
FROM rustlang/rust:nightly-alpine AS rust-builder
RUN apk add --no-cache \
    musl-dev \
    pkgconfig \
    openssl-dev \
    webkit2gtk-dev \
    gtk+3.0-dev \
    libayatana-appindicator-dev \
    librsvg-dev \
    curl \
    wget \
    file

# Установка Tauri CLI
RUN cargo install tauri-cli

WORKDIR /app

# Копирование исходников
COPY --from=node-dependencies /app/node_modules ./node_modules
COPY --from=node-dependencies /app/apps/desktop/node_modules ./apps/desktop/node_modules
COPY . .

# Сборка приложения
WORKDIR /app/apps/desktop
RUN pnpm run build

# Stage 4: Development с VNC для GUI (опционально)
FROM base AS development-vnc
RUN apk add --no-cache \
    chromium \
    xvfb \
    x11vnc \
    fluxbox \
    supervisor

COPY --from=node-dependencies /app/node_modules ./node_modules
COPY --from=node-dependencies /app/apps/desktop/node_modules ./apps/desktop/node_modules
COPY . .

# VNC настройка
ENV DISPLAY=:99
EXPOSE 5900 3000

# Supervisor конфигурация для Xvfb и VNC
RUN mkdir -p /var/log/supervisor
COPY apps/desktop/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Stage 5: Development (только веб-сервер для разработки UI)
FROM base AS development
COPY --from=node-dependencies /app/node_modules ./node_modules
COPY --from=node-dependencies /app/apps/desktop/node_modules ./apps/desktop/node_modules
COPY . .

EXPOSE 1420
WORKDIR /app/apps/desktop
CMD ["pnpm", "run", "dev"]

# Stage 6: CI/CD Build (для автоматической сборки)
FROM rustlang/rust:nightly-slim AS ci-build

# Установка зависимостей для разных платформ
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Установка pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Установка Tauri CLI
RUN cargo install tauri-cli

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/desktop/package.json ./apps/desktop/
RUN pnpm install --frozen-lockfile

COPY . .

# Сборка
WORKDIR /app/apps/desktop
RUN pnpm run tauri build

# Артефакты будут в src-tauri/target/release/bundle/
CMD ["sh"]
