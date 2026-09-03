# Multi-stage Dockerfile для API (NestJS + Prisma)

# Stage 1: Base
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
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @bitrate/api run db:gen
EXPOSE 3000
CMD ["pnpm", "--filter", "@bitrate/api", "run", "start:dev"]

# Stage 4: Build
#
# prisma.config.ts resolves env('DATABASE_URL') when the config is *loaded*, not when a connection
# is opened, so `prisma generate` fails outright without it. Generation only reads the schema, so
# the value below is never dialled — it is deliberately not credential-shaped, because the previous
# ARG default here was a real-looking `postgresql://admin:admin@postgres:5432/…` that invited
# someone to treat it as a working fallback. Nothing from this stage reaches the final image.
FROM base AS build
ENV DATABASE_URL="postgresql://unused:unused@127.0.0.1:5432/prisma-generate-only"
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @bitrate/api run db:gen
RUN pnpm --filter @bitrate/ncs-parser run build
RUN pnpm --filter @bitrate/api run build

# Stage 5: Production Dependencies
FROM base AS prod-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY apps/api/package.json ./apps/api/
COPY packages/converter/package.json ./packages/converter/
COPY packages/converter/bin ./packages/converter/bin
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/ncs-parser/package.json ./packages/ncs-parser/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --prod --frozen-lockfile

# Stage 6: Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma
# Prisma looks for the config in the working directory, and schema.prisma declares no datasource
# url — it comes from here. The TypeScript source, not the compiled output: tsc emits CommonJS
# that Prisma's config loader rejects with "Failed to parse syntax of config file".
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY apps/api/storage ./apps/api/storage
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Generate Prisma Client
RUN pnpm --filter @bitrate/api run db:gen:prod

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bitrateapi

# Set ownership
RUN chown -R bitrateapi:nodejs /app

USER bitrateapi

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health/ready', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"
# dist/src/, not dist/. env.schema.ts and prisma.config.ts live outside src/ and tsconfig sets
# no rootDir, so tsc's common root is apps/api/ and the compiled entrypoint keeps the src/
# segment. The package's own start:prod script already points here; only this line did not.
CMD ["node", "apps/api/dist/src/main.js"]
