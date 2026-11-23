# Multi-stage Dockerfile для Web (Next.js)

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
# package.json of @bitrate/web-player and of each workspace package it depends on, plus a lockfile
# cut down to those importers) and out/full (their sources). Every later stage copies from out/,
# so no other app's dependencies are installed and no other app's source reaches a build layer.
# Pinned to the root devDependency — bump both together.
FROM base AS pruner
RUN npm install -g turbo@2.11.7
COPY . .
RUN turbo prune @bitrate/web-player --docker

# Stage 3: Dependencies
FROM base AS dependencies
COPY --from=pruner /app/out/json/ ./
# pnpm links the svgr bin while installing, so the file it points at has to exist already.
COPY --from=pruner /app/out/full/packages/svgr/bin ./packages/svgr/bin
# The root postinstall runs these two; they return early under the SKIP_* flags below, but node
# still has to find the files. turbo prune does not carry root-level scripts/.
COPY scripts/setup-graphify.mjs scripts/setup-rtk.mjs ./scripts/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 4: Development
FROM base AS development
# node_modules — the root one and every per-package one pnpm created.
COPY --from=dependencies /app/ ./

# Only what `turbo run build --filter=@bitrate/ui-react` touches — its own source plus its
# workspace deps (tailwind; vite-svgr, which itself depends on svgr) — resolved from src, not
# dist, per each package's own exports. Kept ahead of the full source copy below so a change to
# this app's own source does not invalidate this layer and force a cold ui-react rebuild.
# out/json carries no turbo.json; turbo refuses to run without the root one.
COPY --from=pruner /app/out/full/turbo.json ./
COPY --from=pruner /app/out/full/packages/ui-react ./packages/ui-react
COPY --from=pruner /app/out/full/packages/tailwind ./packages/tailwind
COPY --from=pruner /app/out/full/packages/vite-svgr ./packages/vite-svgr
COPY --from=pruner /app/out/full/packages/svgr ./packages/svgr
# CI runs the development image without host build output.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/ui-react

COPY --from=pruner /app/out/full/ ./
EXPOSE 3001
CMD ["pnpm", "--filter", "@bitrate/web-player", "run", "dev"]

# Stage 5: Build
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG API_URL
# Sentry. The DSN is inlined into the browser bundle at build time, so it must
# arrive as a build arg — a runtime-only value never reaches the client. The
# auth token only enables the source map upload and never reaches the bundle,
# so it arrives via --mount=type=secret below instead of ARG/ENV, which would
# otherwise bake it into the image's layer history.
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG SENTRY_RELEASE
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV API_URL=${API_URL}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
ENV NODE_ENV=production
# This image is the deployable artifact, so the deployment URLs above are
# demanded here rather than on every `next build`: lint, typecheck and E2E runs
# legitimately have no canonical origin to give.
ENV ENFORCE_DEPLOY_ENV=1

# node_modules (the root one and every per-package one pnpm created), then the pruned sources.
COPY --from=dependencies /app/ ./
COPY --from=pruner /app/out/full/ ./

# Build приложения. Routed through turbo, not a plain pnpm script, so an unchanged source
# tree (and unchanged build-time env below) restores dist/.next from the remote cache
# instead of rerunning the build; the secret mount is optional, so a build without
# TURBO_TOKEN — a fork PR, a local docker build — just runs uncached.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/ui-react
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/web-player

# Stage 6: Production
#
# There is no prod-dependencies stage any more. `output: 'standalone'` in next.config.ts makes
# `next build` trace the server's real imports into .next/standalone, node_modules included, so
# installing the production dependency tree a second time and copying the hoisted result was
# shipping the whole graph to carry the fraction a request touches: 1.97 GB on the published
# v1.1.0 image, then duplicated by the chown that came after it.
FROM base AS production
ENV NODE_ENV=production
# node:26-alpine is rebuilt upstream only every few weeks, while Alpine ships fixes for its
# packages (zlib, musl, ...) in between; upgrading here keeps the scan clean without waiting
# for a new tag.
RUN apk upgrade --no-cache
# server.js reads both. `pnpm start --port 3001` used to supply the port, and it also kept a
# pnpm wrapper process alive for the lifetime of the container purely to spawn next — two of
# them, at ~105 MB RSS each, were visible on the production host.
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Before the copies, so `COPY --chown=` can resolve the name. Ownership rides along on each
# copy instead of being applied afterwards by `chown -R /app`, which rewrites every file's
# metadata and therefore writes a second complete copy of the tree into its own layer.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bitrateweb && \
    chown bitrateweb:nodejs /app

# outputFileTracingRoot is the repository root, so the standalone tree is laid out from there:
# it unpacks onto /app as apps/web-player/server.js plus the traced node_modules beside it.
COPY --from=build --chown=bitrateweb:nodejs /app/apps/web-player/.next/standalone ./
# Neither of these is part of the trace — the minimal server serves them only if they are put
# where it expects, which is why `next build` leaves them out and the docs copy them by hand.
COPY --from=build --chown=bitrateweb:nodejs /app/apps/web-player/.next/static ./apps/web-player/.next/static
COPY --from=build --chown=bitrateweb:nodejs /app/apps/web-player/public ./apps/web-player/public

USER bitrateweb

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode < 500 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "apps/web-player/server.js"]
