# Multi-stage Dockerfile для API (NestJS + Prisma)

# Stage 1: Base
# prisma.config.ts resolves env('DATABASE_URL') when the config is *loaded*, not when a connection
# is opened, so `prisma generate` fails outright without it. Generation only reads the schema, so
# this is never dialled — and it is deliberately not credential-shaped, because the ARG that used
# to sit here defaulted to a real-looking postgresql://admin:admin@postgres:5432/… that invited
# someone to treat it as a working fallback. It is passed per-command rather than set as ENV so
# that nothing lands in the published image's environment.
ARG PRISMA_GENERATE_ONLY_URL="postgresql://unused:unused@127.0.0.1:5432/prisma-generate-only"

FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY apps/api/package.json ./apps/api/
COPY packages/converter/package.json ./packages/converter/
COPY packages/converter/bin ./packages/converter/bin
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/ncs-parser/package.json ./packages/ncs-parser/
COPY turbo.json ./
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
ARG PRISMA_GENERATE_ONLY_URL
ENV DATABASE_URL=$PRISMA_GENERATE_ONLY_URL
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @bitrate/api run db:gen
EXPOSE 3000
CMD ["pnpm", "--filter", "@bitrate/api", "run", "start:dev"]

# Stage 4: Build
FROM base AS build
ARG PRISMA_GENERATE_ONLY_URL
ENV DATABASE_URL=$PRISMA_GENERATE_ONLY_URL
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @bitrate/api run db:gen
RUN pnpm --filter @bitrate/ncs-parser run build
RUN pnpm --filter @bitrate/api run build

# Stage 5: Production Dependencies
FROM base AS prod-dependencies
ARG PRISMA_GENERATE_ONLY_URL
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY apps/api/package.json ./apps/api/
COPY packages/converter/package.json ./packages/converter/
COPY packages/converter/bin ./packages/converter/bin
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/ncs-parser/package.json ./packages/ncs-parser/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --prod --frozen-lockfile

# Prisma Client is generated here rather than in the production stage so that stage writes
# nothing at all: every one of its layers is then a `COPY --chown`, and it needs no
# `chown -R` to hand /app to the runtime user. The schema is copied after the install, so a
# schema edit re-runs only the generate and leaves the install layer cached.
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts
RUN DATABASE_URL="$PRISMA_GENERATE_ONLY_URL" pnpm --filter @bitrate/api run db:gen:prod

# Stage 6: Production
FROM base AS production
ENV NODE_ENV=production

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
# `task prod:migrate` runs `prisma migrate deploy` in a throwaway container from this image, so
# the migrations have to be here even though generation happened upstream.
COPY --chown=bitrateapi:nodejs apps/api/prisma ./apps/api/prisma
# Prisma looks for the config in the working directory, and schema.prisma declares no datasource
# url — it comes from here. The TypeScript source, not the compiled output: tsc emits CommonJS
# that Prisma's config loader rejects with "Failed to parse syntax of config file".
COPY --chown=bitrateapi:nodejs apps/api/prisma.config.ts ./apps/api/prisma.config.ts
# public/ only. app.module.ts points ServeStaticModule at join(__dirname,'..','..','storage',
# 'public') — /app/apps/api/storage/public — so that one subtree is load-bearing. The sibling
# private/ is seeded audio: 823 MB on a developer checkout, and `apps/api/storage/.gitignore`
# keeps all of it out of git, so a CI image never contained it and a locally built one did.
COPY --chown=bitrateapi:nodejs apps/api/storage/public ./apps/api/storage/public
COPY --chown=bitrateapi:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=bitrateapi:nodejs apps/api/package.json ./apps/api/

# The runtime storage root, and a different path from the seed directory above. CMD runs
# `node apps/api/dist/src/main.js` from WORKDIR /app, so process.cwd() is /app and
# apps/api/src/common/config/storage.config.ts resolves every upload path under /app/storage.
# Creating it here is what lets infra/docker-compose.prod.yaml mount a named volume over it:
# Docker initialises an empty volume from the image directory, ownership included, so the
# non-root user needs no chown on the host. Two empty directories, so the recursive chown
# scoped to them costs nothing.
RUN mkdir -p /app/storage/private /app/storage/public \
    && chown -R bitrateapi:nodejs /app/storage

USER bitrateapi

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health/ready', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"
# dist/src/, not dist/. env.schema.ts and prisma.config.ts live outside src/ and tsconfig sets
# no rootDir, so tsc's common root is apps/api/ and the compiled entrypoint keeps the src/
# segment. The package's own start:prod script already points here; only this line did not.
CMD ["node", "apps/api/dist/src/main.js"]
