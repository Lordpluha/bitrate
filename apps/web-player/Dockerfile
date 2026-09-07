# Multi-stage Dockerfile для Web (Next.js)

# Stage 1: Base
FROM node:26-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate && pnpm config set store-dir /pnpm/store
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY apps/web-player/package.json ./apps/web-player/
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/svgr/package.json ./packages/svgr/
COPY packages/svgr/bin ./packages/svgr/bin
COPY packages/vite-svgr/package.json ./packages/vite-svgr/
COPY packages/contracts/package.json ./packages/contracts/
COPY turbo.json ./
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY . .
COPY --from=dependencies /app/apps/web-player/node_modules ./apps/web-player/node_modules
COPY --from=dependencies /app/packages/ui-react/node_modules ./packages/ui-react/node_modules
EXPOSE 3001
CMD ["pnpm", "--filter", "@bitrate/web-player", "run", "dev"]

# Stage 4: Build
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV API_URL=${API_URL}
ENV NODE_ENV=production
# This image is the deployable artifact, so the deployment URLs above are
# demanded here rather than on every `next build`: lint, typecheck and E2E runs
# legitimately have no canonical origin to give.
ENV ENFORCE_DEPLOY_ENV=1

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY . .
COPY --from=dependencies /app/apps/web-player/node_modules ./apps/web-player/node_modules
COPY --from=dependencies /app/packages/ui-react/node_modules ./packages/ui-react/node_modules
COPY --from=dependencies /app/packages/vite-svgr/node_modules ./packages/vite-svgr/node_modules

# Build приложения
RUN pnpm --filter @bitrate/ui-react run build
RUN pnpm --filter @bitrate/web-player run build

# Stage 5: Production Dependencies
FROM base AS prod-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts ./scripts
COPY apps/web-player/package.json ./apps/web-player/
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/contracts/package.json ./packages/contracts/
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --prod --frozen-lockfile

# Stage 6: Production
FROM base AS production
ENV NODE_ENV=production

COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/apps/web-player/node_modules ./apps/web-player/node_modules
COPY --from=build /app/apps/web-player/.next ./apps/web-player/.next
COPY --from=build /app/apps/web-player/public ./apps/web-player/public
COPY apps/web-player/next.config.ts ./apps/web-player/
COPY apps/web-player/env.schema.ts ./apps/web-player/
COPY apps/web-player/package.json ./apps/web-player/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bitrateweb

# Set ownership
RUN chown -R bitrateweb:nodejs /app

USER bitrateweb

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode < 500 ? 0 : 1)}).on('error', () => process.exit(1))"

WORKDIR /app/apps/web-player
CMD ["pnpm", "start", "--port", "3001"]
