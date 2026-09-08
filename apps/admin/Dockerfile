# Multi-stage Dockerfile для Admin (Angular SPA)

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
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui-react/package.json ./packages/ui-react/
COPY packages/svgr/package.json ./packages/svgr/
COPY packages/svgr/bin ./packages/svgr/bin
COPY packages/vite-svgr/package.json ./packages/vite-svgr/
COPY turbo.json ./
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY . .
COPY --from=dependencies /app/apps/admin/node_modules ./apps/admin/node_modules
EXPOSE 3005
CMD ["pnpm", "--filter", "@bitrate/admin", "run", "dev"]

# Stage 4: Build
FROM base AS build
# esbuild substitutes this at BUILD time through `define`, so it cannot be a runtime ENV in the
# production stage. The deployment variable is the shared NEXT_PUBLIC_API_URL; compose and CI map
# it to this app's name, the same way they do for the artists portal.
ARG NG_APP_API_URL=http://localhost:3000
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY . .
COPY --from=dependencies /app/apps/admin/node_modules ./apps/admin/node_modules

# `--define` overrides angular.json's development default. The value must arrive as a JSON
# string literal, hence the escaped quotes.
RUN pnpm --filter @bitrate/admin exec ng build \
      --define "NG_APP_API_URL=\"${NG_APP_API_URL}\""

# Stage 5: Production — static files behind nginx. There is no server to run: the app is an SPA
# by decision (it sits entirely behind operator auth, so it has nothing to server-render).
FROM nginx:alpine AS production

COPY --from=build /app/apps/admin/dist/admin/browser /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3005/ || exit 1
