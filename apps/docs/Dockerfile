# Multi-stage Dockerfile for the documentation site (Docusaurus).
#
# The build installs inside its own stage rather than copying node_modules across stages. That
# copy is what broke this image: pnpm's isolated linker created `apps/*/node_modules` for
# importers it read from the lockfile while leaving none for `apps/docs`, so
# `COPY --from=dependencies /app/apps/docs/node_modules` failed with "not found". Installing where
# the build runs removes the guesswork about which per-package directories exist.

# Stage 1: Base
FROM node:26-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate && pnpm config set store-dir /pnpm/store
WORKDIR /app

# Stage 2: Development
FROM base AS development
COPY . .
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile --filter @bitrate/docs...
EXPOSE 3003
WORKDIR /app/apps/docs
CMD ["pnpm", "run", "start", "--host", "0.0.0.0"]

# Stage 3: Build
FROM base AS build
COPY . .
# Dev dependencies are needed even for a production build: the site is configured in TypeScript
# (docusaurus.config.ts), so the compiler has to be present. NODE_ENV stays unset here for the
# same reason — pnpm drops devDependencies when it is `production`.
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile --filter @bitrate/docs...
RUN NODE_ENV=production pnpm --filter @bitrate/docs run build

# Stage 4: Production
FROM nginx:1.31-alpine AS production
COPY --from=build /app/apps/docs/build /usr/share/nginx/html
COPY infra/nginx/static-site.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  # 127.0.0.1, not localhost: /etc/hosts maps localhost to both 127.0.0.1 and ::1, wget tries the
  # IPv6 address first, and `listen 8080` binds IPv4 only — so the check was refused while the site
  # served correctly, and both containers sat marked unhealthy.
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
