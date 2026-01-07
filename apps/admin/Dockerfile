# Multi-stage Dockerfile для Admin (Kottster)

# Stage 1: Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY turbo.json ./
RUN pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/admin/node_modules ./apps/admin/node_modules
COPY . .
EXPOSE 3002
CMD ["pnpm", "--filter", "@spotify/admin", "run", "dev"]

# Stage 4: Build
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/admin/node_modules ./apps/admin/node_modules
COPY . .
RUN pnpm --filter @spotify/admin run build

# Stage 5: Production Dependencies
FROM base AS prod-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
RUN pnpm install --prod --frozen-lockfile

# Stage 6: Production
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3002

COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=build /app/apps/admin/dist ./apps/admin/dist
COPY apps/admin/package.json ./apps/admin/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs spotifyadmin

# Set ownership
RUN chown -R spotifyadmin:nodejs /app

USER spotifyadmin

EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

WORKDIR /app/apps/admin
CMD ["node", "dist/server/server.cjs"]