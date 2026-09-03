# Multi-stage Dockerfile for the Storybook static site.
#
# Storybook is the component workshop for @bitrate/ui-react, published so designers and other
# apps' developers can browse the library without running the monorepo.

# Stage 1: Base
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate && pnpm config set store-dir /pnpm/store
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/svgr/package.json ./packages/svgr/
COPY packages/svgr/bin ./packages/svgr/bin
COPY packages/vite-svgr/package.json ./packages/vite-svgr/
COPY turbo.json ./
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 3: Build
FROM base AS build
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY . .
COPY --from=dependencies /app/packages/ui-react/node_modules ./packages/ui-react/node_modules
COPY --from=dependencies /app/packages/vite-svgr/node_modules ./packages/vite-svgr/node_modules

# The library build first: the svgr plugin generates src/icons/svgr/ during it, and the stories
# import those components.
RUN pnpm --filter @bitrate/ui-react run build
RUN pnpm --filter @bitrate/ui-react run build-storybook

# Stage 4: Production
FROM nginx:1.27-alpine AS production
COPY --from=build /app/packages/ui-react/storybook-static /usr/share/nginx/html
COPY infra/nginx/static-site.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
