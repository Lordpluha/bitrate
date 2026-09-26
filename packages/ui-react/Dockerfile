# Multi-stage Dockerfile for the Storybook static site.
#
# Storybook is the component workshop for @bitrate/ui-react, published so designers and other
# apps' developers can browse the library without running the monorepo.
#
# The build installs in its own stage rather than copying node_modules across stages: pnpm's
# isolated linker does not reliably produce a per-package directory for every importer, and a
# missing one fails the COPY rather than the install, which is a confusing place to find out.

# Stage 1: Base
FROM node:26-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Vercel Remote Cache team id — not a secret, it only identifies which team's cache to read/
# write. TURBO_TOKEN is the credential and arrives per RUN below via --mount=type=secret, so
# it never lands in an image layer.
ENV TURBO_TEAM=team_Ao32Preb1GI1Ohd56uSdfxEZ
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate && pnpm config set store-dir /pnpm/store
WORKDIR /app

# Stage 2: Build
FROM base AS build
COPY . .
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile --filter @bitrate/ui-react...

# The library build first: the svgr plugin generates src/icons/svgr/ during it, and the stories
# import those components. Routed through turbo, not a plain pnpm script, so an unchanged
# source tree restores dist/ (and the ~9s SVGR regen) from the remote cache instead of
# rerunning it; the secret mount is optional (required=false is the default), so a build
# without TURBO_TOKEN — a fork PR, a local docker build — just runs uncached.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    pnpm exec turbo run build --filter=@bitrate/ui-react
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    NODE_ENV=production pnpm exec turbo run storybook:build --filter=@bitrate/ui-react

# Stage 3: Production
FROM nginx:1.31-alpine AS production
COPY --from=build /app/packages/ui-react/storybook-static /usr/share/nginx/html
COPY infra/nginx/static-site.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  # 127.0.0.1, not localhost: /etc/hosts maps localhost to both 127.0.0.1 and ::1, wget tries the
  # IPv6 address first, and `listen 8080` binds IPv4 only — so the check was refused while the site
  # served correctly, and both containers sat marked unhealthy.
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
