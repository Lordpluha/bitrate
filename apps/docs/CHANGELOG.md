# @bitrate/docs

## 1.0.0

### Major Changes

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.

### Minor Changes

- adc2b7c: The design tokens now carry the Bitrate palette instead of Spotify's. `--color-primary` is
  Bitrate Purple `#7c3aed` rather than Spotify green, and its foreground flipped from black to
  white — black on that purple measures 3.69:1 and fails WCAG AA, white measures 5.70:1 and
  clears it. The `green` scale was
  retuned from Spotify's `#1db954` to `#10b981` and now serves only `success` and a chart series;
  `blue`, `red` and `neutral` were retuned to the brand scales; `orange` was replaced by `amber`,
  which is what `warning` and `chart-4` now reference. `--color-spotify-green` and
  `--color-spotify-green-hover` are gone, and the `.bg-auth-spotify` utility is `.bg-auth-brand`.

  A third theme, **dim**, joins dark and light. It is deliberately partial: `:root.dim` overrides
  only the surface, text, border and action roles, so every other role — component-scoped roles
  included — inherits its dark value. Adding a theme to
  `apps/web-player/src/shared/constants/themes.ts` now propagates to the switcher, the provider,
  and the no-flash boot script on its own, rather than needing three hardcoded lists updated.

  Client storage keys moved from the `spotify*` prefixes to `bitrate*`, and the service-worker
  cache is `bitrate-web-player-v1`, so saved playlists, recent searches, player position, the
  restored session, and settings do not carry over and the old cache is evicted once.

  The logo is unchanged on purpose while a Bitrate mark is being designed.

- adc2b7c: The project is now named Bitrate everywhere it names itself: repository metadata, README,
  CONTRIBUTING, the Docusaurus site, the agent layer under `.claude/`, and the GitHub URLs,
  which now point at `github.com/Lordpluha/bitrate`. `PRODUCT.md` no longer describes the brand
  as undecided scaffolding — it records Bitrate, the purple primary, and the three themes as
  settled, and points at `apps/docs/docs/brand/` for the rest.

  The Expo app changed its display name, slug, deep-link scheme, and bundle identifier
  (`com.lordpluha.spotifymobile` to `com.lordpluha.bitratemobile`), so existing installs and
  deep links do not carry over.

  `@bitrate/svgr`'s path-resolution tests derived the workspace root from one developer's home
  directory, so they only passed on that machine and broke the moment the checkout was renamed.
  They now derive it from the test file's own location.

- 92bdb41: Every app now wears the Bitrate mark instead of its scaffold's icon.

  Three apps still shipped their template's identity: the docs site showed the Docusaurus dinosaur as
  both logo and favicon, `apps/desktop` carried Tauri's default icon across all sixteen platform
  sizes, and `apps/mobile` carried Expo's — including the Android adaptive icon, its themed
  monochrome layer, the splash image, and the web favicon.

  The desktop set is regenerated with Tauri's own `tauri icon`, so `.icns` and `.ico` are properly
  multi-resolution rather than renamed PNGs. Its Android and iOS output was discarded: this app
  targets desktop only, and those thirty-five files would have been dead weight.

  Mobile needed more than new pixels. The Android adaptive foreground keeps the mark inside the
  central 66% that the launcher mask guarantees — verified against circular, squircle, and square
  masks — and the monochrome layer is a flat silhouette so Android 13 can recolour it. `icon.png`
  carries no alpha channel, which iOS rejects. `app.json` also held Expo's pale blue `#E6F4FE`
  adaptive background and a white/black splash; all three are the brand dark now.

  The docs site's social card was Docusaurus's, its navbar read `@bitrate/docs`, and the logo's alt
  text was "Site logo". Five unused template images went with them.

  Its `url` is still Docusaurus's `your-docusaurus-site.example.com` placeholder — the site is not
  deployed anywhere, so the correct value depends on where it will live.

- a2c7d43: The documentation site and Storybook get their own hosts: `docs.bitrate.me` and `ui.bitrate.me`.

  Both are prebuilt static bundles served by nginx inside their own container, sharing
  `infra/nginx/static-site.conf`. They listen on 8080 rather than 80 because they run as the
  unprivileged `nginx` user, which cannot bind a port below 1024 — the previous docs image asked for
  port 80 under `USER nginx` and could never have started. Its server config was also assembled by
  an `echo` with line continuations inside single quotes, which writes the backslashes into the file
  for nginx to reject; it is a real file now.

  `packages/ui-react` gained a `build-storybook` script and an image. The library build has to run
  first: the svgr plugin generates `src/icons/svgr/` during it and the stories import from there.

  The edge nginx routes both through one shared snippet that takes its backend from a
  `$static_upstream` variable set in each server block — a variable rather than a literal, so a
  recreated container with a new address does not serve 502 until nginx restarts.

  The service worker's cache version is bumped to v3. `/icon.svg` kept its path through the logo
  replacement, so every client that had already installed v2 went on serving the old mark from its
  precache — the network copy is only consulted after a version change clears it.

- 10095e5: Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
  the Node version CI already built and tested against. Previously CI ran on Node 24 while
  each shipped container ran Node 22, so no pipeline exercised the runtime that actually
  served traffic.
- fb09f8e: The production stack could not start. `infra/nginx/conf.d/default.conf` declared an upstream for
  a `docs` service that exists in neither the production compose nor the preprod stack unless its
  `docs` profile is enabled — and nginx refuses to start when a static upstream does not resolve,
  so the first `up` took the whole site down. That route now resolves through Docker's DNS at
  request time, degrading to a 502 instead of a startup failure.

  Two directives applied at server level and were inherited by every route, `/api` included:
  `Cache-Control: public, max-age=3600` and `Access-Control-Allow-Origin: *`. Authenticated API
  responses were served as publicly cacheable and readable cross-origin. Both are gone; caching
  belongs to the routes that serve cacheable bytes, and CORS belongs to the API.

  Production now terminates TLS. The routes and upstreams moved into `infra/nginx/snippets/`,
  shared by the preprod HTTP server and a new production template that adds HTTPS, HSTS, an ACME
  challenge location, and a redirect, with the domain substituted from `DOMAIN`.

  The admin panel's Kottster secret key, API token, JWT salt, root credentials, and database
  password were literals tracked in a public repository. The app has since been removed entirely
  (ADR-0025), which narrows what they open but does not un-publish them: **the Kottster API token
  must still be revoked in its dashboard.**

  Also: every production container caps its logs at 10 MB × 3 files, `task db:backup` and
  `task db:restore` were added, and the deployment guide was rewritten against the actual
  repository — its commands pointed at paths that do not exist, and it described Elastic Beanstalk,
  Cloud Run, Azure, and Kubernetes deployments that were never configured.

- 99b987e: The Kottster admin panel is gone — the app, its agent and rule file, the `kottster` skill, two CI
  workflows and its slot in four more, the service in both compose stacks, the nginx upstream and
  `/admin` route, and five required environment variables. ADR-0025 records why: it published its
  own credentials in a public repository, it wrote to PostgreSQL directly so no API guard,
  validation rule, or queue job applied to anything done through it, and it was one page over a
  Prisma-managed join table.

  Operator tasks have no interface now. That is a gap, not a solved problem — a replacement should
  go through the API rather than around it. The published Kottster API token still needs revoking in
  its dashboard; deleting the code does not un-publish it.

### Patch Changes

- b6880b8: Documents that `NEXT_PUBLIC_API_URL`, `API_BASE_URL`, and `API_URL` hold an origin with no path.
  The API sets a global prefix of `api` and both fetch clients build `${base}/api/v1/…`
  themselves, so putting the prefix in the variable produces `/api/api/v1/…` and a 404 on every
  request — while the app still starts cleanly, which makes it look like a routing problem rather
  than a configuration one. Also records that `NEXT_PUBLIC_*` are build-time and need a rebuild,
  not a restart.
- c4762b7: Pinned the vulnerable transitive dependencies flagged by Dependabot to their
  patched releases through pnpm overrides, and moved Next.js to 16.2.11. The
  affected packages reached the apps at runtime — multer, socket.io-parser, qs
  and body-parser in the API, dompurify and mermaid in the docs site, next in
  both web frontends — so this closes the advisories in shipped code rather
  than in tooling alone.
- fc0ff79: Migrations could not run in production. The API image did not include `prisma.config.ts`, and
  `schema.prisma` declares a datasource with no `url` — the URL comes only from that config — so
  every Prisma command failed with "The datasource.url property is required". The image now carries
  the TypeScript config at the path Prisma looks in — the compiled output is CommonJS, which
  Prisma's config loader rejects outright.

  `task prod:migrate` and `task prod:seed` were added. The documented `task db:migrate` targets the
  preprod stack and runs `prisma migrate dev`, which generates migrations, requires a shadow
  database, and can reset the database it is pointed at — not something to aim at production.

- fcfda6d: The documentation and Storybook containers report their health correctly.

  Their healthcheck asked for `http://localhost:8080/`, and `/etc/hosts` in these images maps
  `localhost` to both `127.0.0.1` and `::1`. wget tries the IPv6 address first while `listen 8080`
  binds IPv4 only, so every check was refused and both containers sat marked unhealthy while serving
  their sites correctly to everyone. It asks for `127.0.0.1` now.

  This mattered beyond a misleading `docker ps`: the deploy gate treats an unhealthy container as a
  failed release, so it would have blocked deploys of two services that were working.

- e4c56e0: Both static-site images install where they build instead of copying `node_modules` between stages,
  and Storybook's chrome carries the product's identity.

  The cross-stage copy is what made the documentation image unbuildable. pnpm's isolated linker
  created `apps/api/node_modules` and `apps/web-artists/node_modules` — importers it read from the
  lockfile, whose `package.json` the image never even copied — while creating none for `apps/docs`,
  the one package it did copy. `COPY --from=dependencies /app/apps/docs/node_modules` then failed
  with "not found", which points at the copy rather than at the install that actually decided
  nothing needed linking.

  Both images now run `pnpm install --frozen-lockfile --filter <pkg>...` in the stage that builds.
  The documentation build also has to keep dev dependencies: the site is configured in TypeScript,
  so the compiler must be present even for a production build, and pnpm drops them when `NODE_ENV`
  is `production`.

  `packages/ui-react` already had a `storybook:build` script, so the image uses it rather than the
  second one this branch briefly added. A `.storybook/manager.ts` sets the brand title and a dark
  base to match the library, whose own default theme is dark — a light manager around dark
  components reads as a rendering fault.

  `task prod:deploy` pulls the images CI publishes and restarts, with `--no-build` so a missing
  image fails loudly instead of silently falling back to a twenty-minute build on the server.

- c92e9fc: The documentation and Storybook sites stop redirecting visitors to an internal address.

  nginx builds an absolute `Location` from its own scheme and listening port. Inside these containers
  those are `http` and `8080`, so following any link without a trailing slash sent the browser to
  `http://docs.bitrate.me:8080/…` — a port that is not published and a scheme that is not encrypted.
  Every navigation link on a Docusaurus site is affected, which is why the sites looked fine on a
  direct URL and broke as soon as anyone clicked anything.

  `absolute_redirect off` makes the `Location` relative, so the browser resolves it against the URL
  it actually requested and the edge proxy's scheme and host survive.
