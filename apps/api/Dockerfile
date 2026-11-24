# Multi-stage Dockerfile для API (NestJS + Prisma)

# Stage 1: Base
# prisma.config.ts resolves env('DATABASE_URL') when the config is *loaded*, not when a connection
# is opened, so `prisma generate` fails outright without it. Generation only reads the schema, so
# this is never dialled — and it is deliberately not credential-shaped, because the ARG that used
# to sit here defaulted to a real-looking postgresql://admin:admin@postgres:5432/… that invited
# someone to treat it as a working fallback. It is passed per-command rather than set as ENV so
# that nothing lands in the published image's environment.
ARG PRISMA_GENERATE_ONLY_URL="postgresql://unused:unused@127.0.0.1:5432/prisma-generate-only"

FROM node:26-alpine AS base
# Vercel Remote Cache team id — not a secret, it only identifies which team's cache to read/
# write. TURBO_TOKEN is the credential and arrives per RUN via --mount=type=secret, so it
# never lands in an image layer.
ENV TURBO_TEAM=team_Ao32Preb1GI1Ohd56uSdfxEZ
RUN npm install -g pnpm@12.7.0
WORKDIR /app

# Stage 2: Prune
# The only stage that sees the whole repository. `turbo prune --docker` writes out/json (the
# package.json of @bitrate/api and of each workspace package it depends on, plus a lockfile cut
# down to those importers, and patches/) and out/full (their sources). Every later stage copies
# from out/, so no other app's dependencies are installed and no other app's source reaches a
# build layer. Pinned to the root devDependency — bump both together.
FROM base AS pruner
RUN npm install -g turbo@2.11.7
COPY . .
RUN turbo prune @bitrate/api --docker

# Stage 3: Dependencies
FROM base AS dependencies
COPY --from=pruner /app/out/json/ ./
# pnpm links the converter bin while installing, so the file it points at has to exist already.
COPY --from=pruner /app/out/full/packages/converter/bin ./packages/converter/bin
# The root postinstall runs these two; they return early under the SKIP_* flags below, but node
# still has to find the files. turbo prune does not carry root-level scripts/.
COPY scripts/setup-graphify.mjs scripts/setup-rtk.mjs ./scripts/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 4: Development
FROM base AS development
ARG PRISMA_GENERATE_ONLY_URL
ENV DATABASE_URL=$PRISMA_GENERATE_ONLY_URL
# node_modules (the root one and every per-package one pnpm created), then the pruned sources.
COPY --from=dependencies /app/ ./
COPY --from=pruner /app/out/full/ ./
RUN pnpm --filter @bitrate/api run db:gen
# Built here, not left to `prestart:dev`: throwaway `docker compose run` commands (migrations,
# `prisma db seed`) never go through that pnpm lifecycle hook, and the CI overlay strips the
# `../packages` bind mount that would otherwise supply a host-built dist. Without this, any
# runtime import of @bitrate/ncs-parser in such a container hits MODULE_NOT_FOUND. Routed
# through turbo, not a plain pnpm script, so an unchanged package restores dist/ from the
# remote cache; the secret mount is optional, so a build without TURBO_TOKEN just runs
# uncached.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/ncs-parser
EXPOSE 3000
CMD ["pnpm", "--filter", "@bitrate/api", "run", "start:dev"]

# Stage 5: Build
FROM base AS build
ARG PRISMA_GENERATE_ONLY_URL
ENV DATABASE_URL=$PRISMA_GENERATE_ONLY_URL
COPY --from=dependencies /app/ ./
COPY --from=pruner /app/out/full/ ./
RUN pnpm --filter @bitrate/api run db:gen
# turbo builds @bitrate/ncs-parser first via dependsOn: ["^build"], then @bitrate/api — one
# call in place of the two separate pnpm filters, and either step restores from the remote
# cache when its own inputs are unchanged. The secret mount is optional, so a build without
# TURBO_TOKEN — a fork PR, a local docker build — just runs uncached.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/api

# Stage 6: Production Dependencies
FROM base AS prod-dependencies
ARG PRISMA_GENERATE_ONLY_URL
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/full/packages/converter/bin ./packages/converter/bin
COPY scripts/setup-graphify.mjs scripts/setup-rtk.mjs ./scripts/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --prod --frozen-lockfile
# The transcode worker imports @bitrate/converter at runtime (audio-encoding.ts). The install
# above only links apps/api/node_modules/@bitrate/converter to ../../../../packages/converter;
# the package's own source has to be in the image too, or every conversion job fails with
# MODULE_NOT_FOUND. It ships plain .mjs, so there is nothing to build.
COPY packages/converter/src ./packages/converter/src

# Prisma Client is generated here rather than in the production stage so that stage writes
# nothing at all: every one of its layers is then a `COPY --chown`, and it needs no
# `chown -R` to hand /app to the runtime user. The schema is copied after the install, so a
# schema edit re-runs only the generate and leaves the install layer cached.
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts
RUN DATABASE_URL="$PRISMA_GENERATE_ONLY_URL" pnpm --filter @bitrate/api run db:gen:prod

# Stage 7: Production
FROM base AS production
ENV NODE_ENV=production
# node:26-alpine is rebuilt upstream only every few weeks, while Alpine ships fixes for its
# packages (zlib, musl, ...) in between; upgrading here keeps the scan clean without waiting
# for a new tag.
RUN apk upgrade --no-cache

# Created first so the `COPY --chown=` instructions below can resolve the name. Ownership then
# rides along on each copy instead of being applied afterwards by a `chown -R /app`: a recursive
# chown rewrites the metadata of every file it walks, so the layer it produces holds a second
# complete copy of them — 482 MB of published bytes on v1.1.0, duplicating the 452 MB above it.
# The chown that remains here is on /app itself, not -R, because WORKDIR created that directory
# as root:root and the deleted `chown -R` had been handing it over as a side effect.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bitrateapi && \
    chown bitrateapi:nodejs /app

# node_modules already carries the generated Prisma Client — see the prod-dependencies stage.
COPY --from=prod-dependencies --chown=bitrateapi:nodejs /app/node_modules ./node_modules
COPY --from=prod-dependencies --chown=bitrateapi:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=bitrateapi:nodejs /app/apps/api/dist ./apps/api/dist
# The target of apps/api/node_modules/@bitrate/converter — see the prod-dependencies stage.
# Copied whole so any version the hoisted install nested under it comes along.
COPY --from=prod-dependencies --chown=bitrateapi:nodejs /app/packages/converter ./packages/converter
# The support assistant core (ADR-0074): an ESM workspace package the API loads at runtime.
# Its package.json resolves the `exports`; the build stage compiled its dist.
COPY --from=prod-dependencies --chown=bitrateapi:nodejs /app/packages/support-core/package.json ./packages/support-core/package.json
COPY --from=build --chown=bitrateapi:nodejs /app/packages/support-core/dist ./packages/support-core/dist
# Knowledge sources the API indexes into Qdrant on start (ADR-0075): every help article and the
# published legal texts allowlisted in legal-knowledge-sources.ts, never the legal drafts.
COPY --chown=bitrateapi:nodejs apps/docs/docs/help ./apps/api/knowledge/help
COPY --chown=bitrateapi:nodejs apps/docs/docs/legal/privacy-policy.md apps/docs/docs/legal/terms-of-use.md ./apps/api/knowledge/legal/
ENV SUPPORT_KNOWLEDGE_DIR=/app/apps/api/knowledge
# `task prod:migrate` runs `prisma migrate deploy` in a throwaway container from this image, so
# the migrations have to be here even though generation happened upstream.
COPY --chown=bitrateapi:nodejs apps/api/prisma ./apps/api/prisma
# Prisma looks for the config in the working directory, and the schema (prisma/schema/) declares no datasource
# url — it comes from here. The TypeScript source, not the compiled output: tsc emits CommonJS
# that Prisma's config loader rejects with "Failed to parse syntax of config file".
COPY --chown=bitrateapi:nodejs apps/api/prisma.config.ts ./apps/api/prisma.config.ts
# The pruned manifests the install above ran from, not the repository's: the full lockfile lists
# every other app's dependencies, none of which are in this image.
COPY --from=prod-dependencies --chown=bitrateapi:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --chown=bitrateapi:nodejs apps/api/package.json ./apps/api/

# /app/worker-tmp is the transcode worker's scratch root (AUDIO_SCRATCH_ROOT, set on the
# `worker` service). The named volume `worker_tmp` is seeded from this empty, non-root-owned
# directory, so the worker can write to it without a host chown. The API never mounts it.
# Uploaded files do not live in the image or in a volume: they go to the object store (ADR-0050).
RUN mkdir -p /app/worker-tmp \
    && chown -R bitrateapi:nodejs /app/worker-tmp

USER bitrateapi

# Fails the build, not the first transcode job in production, when the worker's runtime-only
# workspace dependency cannot be resolved from the API package (a dangling pnpm link).
# Resolved from apps/api, where the pnpm link lives; WORKDIR goes back to /app for CMD and the
# compose `command` paths.
WORKDIR /app/apps/api
RUN node --input-type=module -e "await import('@bitrate/converter')"
# The worker encrypts renditions with Shaka Packager (ADR-0077); its static-pie binary ships in the
# npm package. Fail the build, not the first encrypted transcode, if it is missing or cannot run.
RUN node --input-type=module -e "const { packagerPath } = await import('@bitrate/converter/packager-path'); const { execFileSync } = await import('node:child_process'); execFileSync(packagerPath(), ['--version'], { stdio: 'inherit' })"
WORKDIR /app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health/ready', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"
# dist/src/, not dist/. env.schema.ts and prisma.config.ts live outside src/ and tsconfig sets
# no rootDir, so tsc's common root is apps/api/ and the compiled entrypoint keeps the src/
# segment. The package's own start:prod script already points here; only this line did not.
CMD ["node", "apps/api/dist/src/main.js"]
