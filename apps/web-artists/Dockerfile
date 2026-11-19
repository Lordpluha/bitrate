# Multi-stage Dockerfile для Web Artists (TanStack Start + Vite)

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
# package.json of @bitrate/web-artists and of each workspace package it depends on, plus a lockfile
# cut down to those importers) and out/full (their sources). Every later stage copies from out/,
# so no other app's dependencies are installed and no other app's source reaches a build layer.
# Pinned to the root devDependency — bump both together.
FROM base AS pruner
RUN npm install -g turbo@2.11.7
COPY . .
RUN turbo prune @bitrate/web-artists --docker

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
EXPOSE 3002
CMD ["pnpm", "--filter", "@bitrate/web-artists", "run", "dev"]

# Stage 5: Build
FROM base AS build
# Vite inlines import.meta.env at BUILD time, so this must be an ARG here, not a runtime ENV in
# the production stage. The deployment variable is still called NEXT_PUBLIC_API_URL (shared with
# apps/web-player); the mapping to this app's VITE_ name happens in compose and CI.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
# Public player address (the player's NEXT_PUBLIC_SITE_URL), for links to released albums.
ARG VITE_PLAYER_URL
ENV VITE_PLAYER_URL=${VITE_PLAYER_URL}
ENV NODE_ENV=production

# node_modules (the root one and every per-package one pnpm created), then the pruned sources.
COPY --from=dependencies /app/ ./
COPY --from=pruner /app/out/full/ ./

# Build приложения. Routed through turbo, not a plain pnpm script, so an unchanged source
# tree restores dist/.output from the remote cache instead of rerunning the build; the
# secret mount is optional, so a build without TURBO_TOKEN — a fork PR, a local docker
# build — just runs uncached.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/ui-react
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/web-artists

# Stage 6: Production
# Nitro emits a self-contained bundle in .output — server, static assets and the runtime deps it
# needs — so there is no prod-dependencies stage and no node_modules to copy.
FROM base AS production
ENV NODE_ENV=production
# node:26-alpine is rebuilt upstream only every few weeks, while Alpine ships fixes for its
# packages (zlib, musl, ...) in between; upgrading here keeps the scan clean without waiting
# for a new tag.
RUN apk upgrade --no-cache

# The user is created BEFORE anything is copied, because `COPY --chown=` resolves a named
# owner against the image's /etc/passwd as it runs. Ownership then rides along on the copy
# instead of being applied afterwards by `chown -R`, which is what the standalone chown used
# to do — and a chown rewrites every file's metadata, so the layer it produces holds a second
# complete copy of everything underneath it. Measured on this image: `COPY .output` 226 MB,
# `RUN chown -R /app` another 226 MB for nothing.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bitrateweb && \
    chown bitrateweb:nodejs /app

COPY --from=build --chown=bitrateweb:nodejs /app/apps/web-artists/.output ./.output

USER bitrateweb

EXPOSE 3002
ENV PORT=3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  # Anything below 500 counts: the root path answers 307 to /auth/login because the artists
  # portal is behind auth, so demanding exactly 200 marked a working server unhealthy forever.
  CMD node -e "require('http').get('http://localhost:3002', (r) => {process.exit(r.statusCode < 500 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
