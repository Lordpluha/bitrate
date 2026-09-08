# Multi-stage Dockerfile для Web Artists (TanStack Start + Vite)

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
COPY apps/web-artists/package.json ./apps/web-artists/
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
COPY --from=dependencies /app/apps/web-artists/node_modules ./apps/web-artists/node_modules
COPY --from=dependencies /app/packages/ui-react/node_modules ./packages/ui-react/node_modules
EXPOSE 3002
CMD ["pnpm", "--filter", "@bitrate/web-artists", "run", "dev"]

# Stage 4: Build
FROM base AS build
# Vite inlines import.meta.env at BUILD time, so this must be an ARG here, not a runtime ENV in
# the production stage. The deployment variable is still called NEXT_PUBLIC_API_URL (shared with
# apps/web-player); the mapping to this app's VITE_ name happens in compose and CI.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY . .
COPY --from=dependencies /app/apps/web-artists/node_modules ./apps/web-artists/node_modules
COPY --from=dependencies /app/packages/ui-react/node_modules ./packages/ui-react/node_modules
COPY --from=dependencies /app/packages/vite-svgr/node_modules ./packages/vite-svgr/node_modules

# Build приложения
RUN pnpm --filter @bitrate/ui-react run build
RUN pnpm --filter @bitrate/web-artists run build

# Stage 5: Production
# Nitro emits a self-contained bundle in .output — server, static assets and the runtime deps it
# needs — so there is no prod-dependencies stage and no node_modules to copy.
FROM base AS production
ENV NODE_ENV=production

COPY --from=build /app/apps/web-artists/.output ./.output

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bitrateweb

# Set ownership
RUN chown -R bitrateweb:nodejs /app

USER bitrateweb

EXPOSE 3002
ENV PORT=3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  # Anything below 500 counts: the root path answers 307 to /auth/login because the artists
  # portal is behind auth, so demanding exactly 200 marked a working server unhealthy forever.
  CMD node -e "require('http').get('http://localhost:3002', (r) => {process.exit(r.statusCode < 500 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
