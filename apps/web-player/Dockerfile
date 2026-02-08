# Multi-stage Dockerfile для Web (Next.js)

# Stage 1: Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-player/package.json ./apps/web-player/
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/contracts/package.json ./packages/contracts/
COPY turbo.json ./
RUN pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web-player/node_modules ./apps/web-player/node_modules
COPY . .
EXPOSE 3001
CMD ["pnpm", "--filter", "@spotify/web-player", "run", "dev"]

# Stage 4: Build
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web-player/node_modules ./apps/web-player/node_modules
COPY . .

# Build приложения
RUN pnpm --filter @spotify/web-player run build

# Stage 5: Production Dependencies
FROM base AS prod-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-player/package.json ./apps/web-player/
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/contracts/package.json ./packages/contracts/
RUN pnpm install --prod --frozen-lockfile

# Stage 6: Production
FROM base AS production
ENV NODE_ENV=production

COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/apps/web-player/node_modules ./apps/web-player/node_modules
COPY --from=build /app/apps/web-player/.next ./apps/web-player/.next
COPY --from=build /app/apps/web-player/public ./apps/web-player/public
COPY apps/web-player/next.config.ts ./apps/web-player/
COPY apps/web-player/package.json ./apps/web-player/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs spotifyweb

# Set ownership
RUN chown -R spotifyweb:nodejs /app

USER spotifyweb

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

WORKDIR /app/apps/web-player
CMD ["pnpm", "start", "--port", "3001"]
