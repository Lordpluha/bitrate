# Multi-stage Dockerfile for the composed Storybook static site.
#
# One catalogue for every UI surface, published so designers and other apps' developers can
# browse the components without running the monorepo. The frameworks differ, so each Storybook
# is built on its own and composed through refs (see packages/ui-react/.storybook/main.ts):
#
#   /         @bitrate/ui-react — the host, React
#   /player/  @bitrate/player   — the <bitrate-player> custom element, Svelte
#   /admin/   @bitrate/admin    — the spartan-ng UI kit, Angular
#
# All three sit on one origin, so the host reads the others' index.json without CORS.
#
# The build installs in its own stage rather than copying node_modules across stages: pnpm's
# isolated linker does not reliably produce a per-package directory for every importer, and a
# missing one fails the COPY rather than the install, which is a confusing place to find out.

# Stage 1: Base
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Vercel Remote Cache team id — not a secret, it only identifies which team's cache to read/
# write. TURBO_TOKEN is the credential and arrives per RUN below via --mount=type=secret, so
# it never lands in an image layer.
ENV TURBO_TEAM=team_Ao32Preb1GI1Ohd56uSdfxEZ
RUN corepack enable && corepack prepare pnpm@12.7.0 --activate && pnpm config set store-dir /pnpm/store
WORKDIR /app

# Stage 2: Build
FROM base AS build
COPY . .
RUN SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install --frozen-lockfile \
    --filter @bitrate/ui-react... --filter @bitrate/player... --filter @bitrate/admin...

# storybook:build depends on ^build, so turbo builds what the stories import first — the
# ui-react library (its svgr plugin generates src/icons/svgr/) and the player element the admin
# kit embeds. Routed through turbo, not plain pnpm scripts, so an unchanged source tree restores
# dist/ and storybook-static/ from the remote cache instead of rerunning them; the secret mount
# is optional (required=false is the default), so a build without TURBO_TOKEN — a fork PR, a
# local docker build — just runs uncached. One package at a time: three Storybook builds at
# once is several GiB of memory on a CI runner.
RUN --mount=type=secret,id=turbo_token,env=TURBO_TOKEN \
    NODE_ENV=production pnpm exec turbo run storybook:build --concurrency=1 \
      --filter=@bitrate/ui-react --filter=@bitrate/player --filter=@bitrate/admin

# Stage 3: Production
FROM nginx:1.31-alpine AS production
COPY --from=build /app/packages/ui-react/storybook-static /usr/share/nginx/html
COPY --from=build /app/packages/player/storybook-static /usr/share/nginx/html/player
COPY --from=build /app/apps/admin/storybook-static /usr/share/nginx/html/admin
# The admin stylesheet loads its fonts from the root-absolute /fonts/ — right for the app, which
# owns its origin, but under /admin/ it resolves against the host. Nothing else here uses /fonts/.
COPY --from=build /app/apps/admin/public/fonts /usr/share/nginx/html/fonts
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
