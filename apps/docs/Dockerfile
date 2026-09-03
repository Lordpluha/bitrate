# Multi-stage Dockerfile для Docs (Docusaurus)

# Stage 1: Base
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY apps/docs/package.json ./apps/docs/
COPY turbo.json ./
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/docs/node_modules ./apps/docs/node_modules
COPY . .
EXPOSE 3003
WORKDIR /app/apps/docs
CMD ["pnpm", "run", "start", "--host", "0.0.0.0"]

# Stage 4: Build
FROM base AS build
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/docs/node_modules ./apps/docs/node_modules
COPY . .

# Build приложения
WORKDIR /app/apps/docs
RUN pnpm run build

# Stage 5: Production
FROM nginx:1.27-alpine AS production
COPY --from=build /app/apps/docs/build /usr/share/nginx/html
COPY infra/nginx/static-site.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
