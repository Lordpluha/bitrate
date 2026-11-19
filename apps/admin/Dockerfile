# Multi-stage Dockerfile для Admin (Angular SPA)

# Stage 1: Base
FROM node:26-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Vercel Remote Cache team id — not a secret, it only identifies which team's cache to read/
# write. TURBO_TOKEN is the credential and arrives per RUN below via --mount=type=secret, so
# it never lands in an image layer.
ENV TURBO_TEAM=team_Ao32Preb1GI1Ohd56uSdfxEZ
RUN npm install -g pnpm@12.7.0 && pnpm config set store-dir /pnpm/store
WORKDIR /app

# Stage 2: Prune
# The only stage that sees the whole repository. `turbo prune --docker` writes out/json (the
# package.json of @bitrate/admin and of each workspace package it depends on, plus a lockfile cut
# down to those importers) and out/full (their sources). Every later stage copies from out/, so
# no other app's dependencies are installed and no other app's source reaches a build layer.
# Pinned to the root devDependency — bump both together.
FROM base AS pruner
RUN npm install -g turbo@2.11.7
COPY . .
RUN turbo prune @bitrate/admin --docker

# Stage 3: Dependencies
FROM base AS dependencies
COPY --from=pruner /app/out/json/ ./
# The root postinstall runs these two; they return early under the SKIP_* flags below, but node
# still has to find the files. turbo prune does not carry root-level scripts/.
COPY scripts/setup-graphify.mjs scripts/setup-rtk.mjs ./scripts/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 4: Development
FROM base AS development
COPY --from=dependencies /app/ ./
COPY --from=pruner /app/out/full/ ./
EXPOSE 3005
CMD ["pnpm", "--filter", "@bitrate/admin", "run", "dev"]

# Stage 5: Build
FROM base AS build
# Baked into the bundle at BUILD time, so it cannot be a runtime ENV in the production stage. The
# deployment variable is the shared NEXT_PUBLIC_API_URL; compose and CI map it to this app's name,
# the same way they do for the artists portal. No default on purpose — an unset value fails the
# build with a named variable instead of shipping an image that points at localhost.
ARG NG_APP_API_URL
ENV NG_APP_API_URL=${NG_APP_API_URL}
ENV NODE_ENV=production

# node_modules (the root one and every per-package one pnpm created), then the pruned sources.
COPY --from=dependencies /app/ ./
COPY --from=pruner /app/out/full/ ./

# `scripts/with-env.mjs` reads NG_APP_API_URL from the environment set above and writes the
# generated config module before Angular runs. There is no .env file in the image.
# The secret mount is optional (required=false is the default), so a build without
# TURBO_TOKEN — a fork PR, a local docker build — just runs uncached.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/admin

# Stage 6: Production — static files behind nginx. There is no server to run: the app is an SPA
# by decision (it sits entirely behind operator auth, so it has nothing to server-render).
FROM nginx:1.31-alpine AS production
# The nginx base is rebuilt upstream only every few weeks, while Alpine ships fixes for its
# packages (curl, brotli, ...) in between; upgrading here keeps the scan clean without
# waiting for a new tag.
RUN apk upgrade --no-cache

# Run as the image's unprivileged `nginx` user. Port 3005 is already above 1024; the pid file and
# temp/cache paths default to root-only locations, so the pid moves to /tmp and the cache dir is
# handed to nginx. The `user` directive only applies to a root master and is dropped.
RUN sed -i -e '/^user /d' -e 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
  && chown -R nginx:nginx /var/cache/nginx

COPY --from=build --chown=nginx:nginx /app/apps/admin/dist/admin/browser /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

USER nginx
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  # 127.0.0.1, not localhost: wget tries ::1 first and `listen 3005` binds IPv4 only.
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3005/ || exit 1
