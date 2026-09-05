# @bitrate/api

## 1.0.0

### Major Changes

- adc2b7c: Copy that named Spotify is gone. The artists portal no longer reproduces Spotify for Artists'
  marketing page: `© 2026 Spotify AB` is `© 2026 Bitrate`, and the branded product names it
  borrowed — Canvas, Marquee, Discovery Mode, Loud & Clear, Showcase, Clips, Segments, Fan Study,
  Fan Support — are now plain descriptions of what each capability does, so the page no longer
  claims another company's products. A testimonial that named a real recording artist as a
  Spotify for Artists user was rewritten without her, rather than re-attributed to Bitrate.

  The landing page claimed "517.69 million+ Spotify users worldwide" — a real Spotify figure that
  would have become a fabricated claim about Bitrate. It now reads "Artists and listeners, in one
  place" and asserts no number. Two footers carried `© 2025` and `© 2026 Spotify AB`; both are
  now `© 2026 Bitrate`.

  `Spotify Premium` is `Bitrate Pro`, matching the name `design.md` already uses.

  The TOTP issuer for both user and artist two-factor auth changed from `Spotify` to `Bitrate`.
  Authenticator apps key their entries on the issuer, so codes already enrolled keep working but
  show under a second entry — enrolled users should re-scan.

  Seed data no longer ships `Spotify Clone Studios` as a publisher or `Welcome to Spotify Clone`
  as a playlist title.

- adc2b7c: Infrastructure identifiers moved off the Spotify name. The Postgres databases are now
  `bitrate`, `bitrate_shadow`, `bitrate_test`, and `bitrate_test_shadow`; the Docker network is
  `bitrate-network`; every container and container-image OS user is `bitrate-*`; the mail sender
  is `no-reply@bitrate.local`; and the admin panel's Knex data source lives in
  `bitrate_postgres_local`. The Postgres role and password the performance workflows spin up in
  CI are now `bitrate` / `bitrate_password`.

  Two identifiers break existing consumers. The Prometheus metrics `spotify_api_http_requests_total`
  and `spotify_api_http_request_duration_ms_sum` are now `bitrate_api_http_*`, so dashboards and
  alerts querying the old names stop returning data. The Redis rate-limit key prefix changed from
  `spotify:throttle:` to `bitrate:throttle:`, so counters in flight at deploy time reset and every
  client starts from a clean budget once.

  The Tauri desktop app renamed its Rust crate (`spotify-desktop` to `bitrate-desktop`, library
  `bitrate_desktop_lib`), its bundle identifier (`com.lordpluha.bitrate-desktop`), and its product
  name, which is now `Bitrate` rather than a hyphenated slug — so the produced bundle filenames
  change. Its dev-only VNC password is `bitrate`.

  Existing databases are not migrated. A running environment needs its volume recreated and the
  migrations and seed re-run.

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.
- cfed21e: Every API request through nginx returned 404. `main.ts` calls `setGlobalPrefix('api')`, so the
  API serves at `/api/v1/...`, while the nginx `/api` location rewrote the path to strip that
  prefix before proxying. The API is reachable from the internet again.
- 2f8bd87: One host, one application. The web player answers on the apex, the artists portal on
  `artists.<domain>`, and the API on `api.<domain>`; the path routes on the main domain are gone.

  Two of those paths were already broken. `/uploads` proxied to a route the API does not have —
  its static mount is `/static` — and `/docs` pointed at a service absent from the production
  stack. `/api` worked but duplicated what the API host now serves.

  The API host routes each URL shape explicitly rather than through one catch-all: `setGlobalPrefix`
  covers the endpoints but not Swagger or the static mount, so a blanket rewrite would have turned
  `/swagger` into a 404. Endpoints are reachable both as `/api/v1/…` and `/v1/…`, so the clients can
  drop the redundant segment when convenient.

- 41b95b9: The production API could not start. `apps/api/env.schema.ts` requires `WEB_HOST`, and
  `infra/docker-compose.prod.yaml` never passed it — the container would fail Zod validation and
  exit before serving a request. Preprod passed it all along, which is why CI never caught it.

  The service's environment moved from map form to list form so optional variables can be passed
  through by bare name. `KEY=${KEY}` gives the container an empty string when the variable is
  unset, and the optional URL and token fields are validated with `z.url()` and `.min(32)`, both
  of which reject an empty string — so writing them out in map form would have replaced a missing
  variable with an invalid one. Mail, S3, Sentry, and metrics settings now reach the container
  when they are configured and stay absent when they are not.

- 8996302: Two container defects that only a real deployment could surface.

  The API image started `apps/api/dist/main.js`, which does not exist. `env.schema.ts` and
  `prisma.config.ts` live outside `src/` and the tsconfig sets no `rootDir`, so the compiler's
  common root is the app directory and the entrypoint compiles to `dist/src/main.js`. The
  package's own `start:prod` script already pointed there; only the Dockerfile did not, so the
  container crash-looped with `MODULE_NOT_FOUND`.

  The web-artists image kept web-player's `EXPOSE 3001` and health check against port 3001 in its
  production stage, while the app starts on 3002. The container ran correctly and reported
  unhealthy forever.

- fc0ff79: Migrations could not run in production. The API image did not include `prisma.config.ts`, and
  `schema.prisma` declares a datasource with no `url` — the URL comes only from that config — so
  every Prisma command failed with "The datasource.url property is required". The image now carries
  the TypeScript config at the path Prisma looks in — the compiled output is CommonJS, which
  Prisma's config loader rejects outright.

  `task prod:migrate` and `task prod:seed` were added. The documented `task db:migrate` targets the
  preprod stack and runs `prisma migrate dev`, which generates migrations, requires a shadow
  database, and can reset the database it is pointed at — not something to aim at production.

- c6b382a: The API could not talk to a password-protected Redis. `env.schema.ts` had no `REDIS_PASSWORD`,
  and both connection sites — the BullMQ root config and the cache module's ioredis client — passed
  only host and port, while the production compose starts Redis with `--requirepass`. Every command
  came back `NOAUTH Authentication required`, so rate limiting, caching, and the job queue were all
  dead in production.

  Redis's health check hid it. `redis-cli --raw incr ping` exits 0 even when the server answers
  NOAUTH, so the container reported healthy while nothing could use it — and the probe incremented
  a key named `ping` in the live database every few seconds. It now authenticates and asserts on
  the reply.

- ff34259: Mail could not be sent from a typical VPS. The transport treated only port 465 as implicit TLS,
  so the alternative port hosts leave open when they block the standard ones — 2465 — would have
  been negotiated as plaintext and failed. Both are now recognised.

  Worth knowing when this bites: providers block outbound 25, 465, and 587 silently, so the
  connection times out rather than being refused and a mail failure presents as a hang with nothing
  in the logs and nothing in the provider's dashboard.

### Minor Changes

- 33c74bc: The published API document identifies itself correctly and no longer advertises a foreign host.

  Its title and description were read from `npm_package_name`, which npm sets only for processes it
  launches. The production image runs `node` directly, so the live document at `/swagger` called
  itself "API Documentation" and described itself as **"undefined Swagger documentation"** — the
  literal string. Both come from named constants now, and the Swagger UI page gains a real tab title.

  The server list still offered `https://spotify-clone-api-jp5z.onrender.com/` alongside
  `http://localhost:3000`, so "Try it out" on the public document pointed at a host that is not ours
  and one that is not reachable. The stale entry is gone and the deployed origin is added from
  `API_BASE_URL` when it is set.

  `setExternalDoc('@bitrate/docs', '')` emitted `externalDocs` with an empty `url`, which OpenAPI
  does not allow. It is removed until the documentation site has an address to point at.

- 9e409ce: Ten variables the API expects now actually reach it in production.

  The compose file listed neither the OAuth credentials nor six token and health settings in the api
  service's environment, so the container never received them. Verified on the running production
  container: all ten were absent. The consequences were silent — the API fell back to its schema
  defaults for token lifetimes, cookie names, the health-check timeout and the mail token flag, so
  changing any of them in `.env` did nothing at all; and Google and Facebook sign-in could not work
  in production regardless of configuration, because neither client id nor secret was passed through.

  They are declared by bare name, the convention the rest of that list already uses: an unset variable
  stays absent rather than arriving as an empty string, which the API's schema would reject.

- 10157ba: The API answers on its own host as well as at `/api` on the main domain. Both paths reach the
  same handler: the service sets a global prefix of `api`, and requests to the new host that omit
  that prefix are rewritten to add it, so `api.<domain>/v1/…` and `api.<domain>/api/v1/…` both
  work. The path route stays in place so the move needs no flag day.

  Requests from the frontends are now cross-origin, which means a CORS preflight before every
  non-simple request. The origins the API accepts come from `USER_WEB_HOST` and `ARTIST_WEB_HOST`,
  and the auth cookies stay same-site — `bitrate.me` and `api.bitrate.me` share a registrable
  domain, so `SameSite=Strict` still sends them.

- 10095e5: Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
  the Node version CI already built and tested against. Previously CI ran on Node 24 while
  each shipped container ran Node 22, so no pipeline exercised the runtime that actually
  served traffic.
- 10095e5: Added `API_RATE_LIMIT_MAX` and `API_RATE_LIMIT_WINDOW_MS` environment overrides for the
  global throttler so a single-IP load test can measure the API instead of the rate limiter.
  Both fall back to the previous 100 requests per 60 seconds when unset or not a positive
  finite number, and neither loosens the auth-route throttle, which stays at 10 per minute.

### Patch Changes

- f72b2f0: Album endpoints returned the `AlbumTrack` join-row id in place of the track's
  own id, because the membership row was spread over the track and its `id` won.
  Every track started from an album page therefore asked the playback endpoints
  for a non-existent id and failed with a 404 on both the CMAF manifest and the
  HLS fallback. The flattening now drops the join row's id while still letting the
  album-specific `trackNumber`/`discNumber` override the track's own.
- b27c405: Swagger examples no longer embed the current time. Four fields in the liked-tracks
  response example called `new Date()` at module load, so every API boot produced a
  different OpenAPI document and therefore a different generated contract. That made
  the contract reproducible only against the exact second it was generated: even a
  freshly committed `v1.ts` would be reported as drifted on the next CI run. The
  examples now use a fixed instant, the way the neighbouring `releaseDate` already did.
- 6b707b2: Build artifacts stay out of the Docker build context, which is the same defect as the env files and
  had two visible effects.

  `.dockerignore` listed `dist/`, `build/`, `.next/` and `out/` as root-relative patterns, so they
  matched only the context root and left every app's and package's output in the context. A published
  web-player image was carrying a `.next/dev/` tree — a development build inside a production image —
  and every build shipped gigabytes to the daemon: the working tree measured 2.9 GB, of which
  `apps/desktop/src-tauri/target` alone was 1.2 GB.

  With `**/` prefixes and the Rust target directory excluded, a web-player build transfers 540 kB of
  context instead, and the resulting image has no `.next/dev` at all. Verified by building it: the
  client bundle contains `https://api.bitrate.me` and no `localhost:3000`.

- 72e98ad: Nested `.env` files are excluded from every Docker build context, and `prisma generate` no longer
  depends on one being there.

  `.dockerignore` patterns are matched against the context root, so a bare `.env` line excluded only
  `./.env` and left `apps/api/.env`, `apps/api/.env.test`, `apps/mobile/.env`, and
  `apps/web-player/.env.development` in the context of every image built with `COPY . .`. They never
  reached a production image — the final stages copy named artifacts rather than the tree — but they
  did land in the build stage, which is exported to the registry as build cache. The patterns are
  `**/.env` and `**/.env.*` now, with the example templates negated back in.

  That exclusion is what surfaced the real bug. `prisma.config.ts` read the shadow database URL as
  `process.env.SHADOW_DATABASE_URL || env('SHADOW_DATABASE_URL')` and then spread it conditionally,
  which reads as "optional" — but Prisma's `env()` throws on a missing variable rather than returning
  undefined, so the conditional could never see a falsy value and loading the config failed outright
  wherever the variable was unset. It builds locally only because a developer's `apps/api/.env` was
  being copied in; CI, which has no such file, failed. The shadow database is only used by
  `migrate dev`, and production runs `migrate deploy`, so it is read from `process.env` and genuinely
  optional now.

  `prisma generate` and the Nest build both load that config, in three stages, so the placeholder URL
  is declared once as a build argument. The two stages that are discarded set it as `ENV`, which
  covers every command in them; the production stage passes it per-command instead, so nothing lands
  in the published image's environment — verified with `docker inspect`.

- 34776a7: Each app ships a `.env.example` generated from its own schema, and the real development env files
  leave version control.

  `apps/api/.env.development` and `apps/web-player/.env.development` were tracked, so a developer
  inherited someone else's values instead of choosing their own. They are untracked now and
  `.gitignore` covers the pattern so they cannot come back by accident.

  The examples are generated from each app's `env.schema.ts` rather than copied from the files they
  replace: every variable appears, grouped by whether the app refuses to start without it, and the
  defaults shown are the schema's own. `apps/api/.env.test` stays tracked on purpose — the E2E suite
  reads it and the CI step that runs it has no environment of its own, so removing it breaks the
  pipeline rather than tidying it.

- 00ae1cc: Hardened the CodeQL-flagged file-upload and cookie call sites in `apps/api` without
  changing their behaviour: every Multer-supplied file path (track audio, track covers, user
  avatars) is now reconstructed from its own directory and server-generated filename before
  being opened or removed, rejecting any filename that would escape its directory. Short-lived
  auth cookies (`pending_2fa_token`, `oauth_state`) now set `httpOnly`/`secure` as literal
  keys at the `res.cookie()` call site instead of through a spread options object. The `access`
  auth guards for users and artists no longer perform a redundant verification of a co-present
  refresh-token cookie: that check could not be bypassed by an attacker (who simply omits the
  cookie) and only rejected legitimate requests whose unrelated refresh token happened to be
  stale.
- 208996d: The web-artists container reported unhealthy while serving correctly. Its root path answers 307
  to `/auth/login` because the portal is behind auth, and the health check demanded exactly 200.
  It now accepts any status below 500 — the check is meant to prove the server is up and routing,
  not that a given page is public.

  All three checks also lacked an error handler on the request, so a refused connection surfaced as
  an unhandled `error` event and a stack trace instead of a clean failure.

- ea3d30a: Deleting a track now actually stops it streaming. Both HLS entry points — the
  master playlist and the per-rendition assets — read the track without checking
  `deletedAt`, and the asset route checked no track state at all, so a soft-deleted
  track kept serving its full audio indefinitely while every other read path in the
  module filtered it out.

  Uploading a track no longer records a `TrackFile` row pointing at a bare multer
  filename rather than a storage key. That row survived publication, so a later
  progressive request for the source format resolved a path that does not exist and
  returned 404 for a perfectly healthy track. The `format` query parameter is now
  restricted to the supported progressive formats instead of accepting any string.

  Ranged responses omit `Content-Length` when the storage driver does not report
  one, instead of sending `0` or the literal text `undefined` alongside a non-empty
  body. Liking an already-liked playlist, or registering a device twice
  concurrently, now returns 409 instead of a generic 500.

- e7e3ab7: Error responses now carry the label that matches their status code. The exception filter seeded
  the `error` field with `Internal Server Error` and replaced it only when the exception supplied
  one of its own, so every exception that omits the field — nestjs-zod's validation exception among
  them — answered `400` under a `500` label. A rejected registration reported
  `{"statusCode":400,"error":"Internal Server Error"}`.

  The label is derived from the resolved status instead, and an exception that does supply its own
  still wins.

- f72b2f0: Track durations stopped being invented. The seeder generated a random 180-300
  second duration and used it to overwrite the real value that had already been
  read from the audio file on upload, so every seeded track was wrong by up to
  147 seconds in either direction, and instrumental versions inherited the main
  track's duration. The seeder now leaves the file-derived duration alone, and
  existing rows were recomputed from the CMAF fragment index.

  Also removed a legacy seeded track that had no audio files at all and was stuck
  in PROCESSING, and corrected a seeder log line that claimed to fall back to the
  remote source URL when a download failed — no such fallback exists, the track is
  skipped instead.

- 9ad8254: Migrations run before the new containers start, not after.

  `prod:migrate` used `compose exec api`, which needs that container already running — so migrations
  could only happen after the restart, and the new code served requests against the old schema for as
  long as they took. That is the worse of the two windows: new code is precisely what needs the new
  columns. It also made every deploy race the container's boot, which the workflow papered over with
  a six-attempt retry loop.

  The migration now runs in a throwaway container from the image just pulled, which needs nothing
  running but the database, so `prod:deploy` is pull, migrate, restart. The retry loop is gone with
  the race that caused it. Old code meeting an already-migrated schema is the safe direction, and it
  stays safe as long as migrations are additive — expand in one release, contract in a later one.

- 3c3ad99: The edge nginx owns port 80 outright, and stops naming its own version to anyone who asks.

  The image ships `conf.d/default.conf`, which sorts before the rendered `prod.conf` and was
  therefore the default server for port 80: every unrecognised `Host` got the stock nginx welcome
  page — version number included — and, more consequentially, an ACME challenge for any name not
  yet listed in `server_name` was answered by that block instead of from the webroot. That is
  exactly the moment a new subdomain's first certificate is issued, so the failure would have
  surfaced as an unexplained validation error. The HTTP block is now `default_server` and the
  image's file is mounted over with an empty one.

  `server_tokens off` removes the version from the `Server` header on every response.

- 9a05a92: nginx resolved each upstream host once at startup and cached the address for the life of the
  process, so every `docker compose up` that recreated a container left the proxy answering 502
  until someone restarted nginx by hand. Routing now goes through a variable with Docker's embedded
  resolver, which defers the lookup to request time.

  A side effect worth having: `nginx -t` used to fail with "host not found in upstream" unless the
  application containers were already running, so the configuration could not be validated on its
  own. It now checks anywhere.

- f72b2f0: OAuth redirect URIs now include the API's global prefix and version. The
  callback routes live under `/api/v1`, but the URI handed to Google and Facebook
  pointed at `/auth/oauth/<provider>/callback`, which 404s — so sign-in would have
  failed on the return leg the moment credentials were configured, for both the
  user and the artist flows.
- c4762b7: Pinned the vulnerable transitive dependencies flagged by Dependabot to their
  patched releases through pnpm overrides, and moved Next.js to 16.2.11. The
  affected packages reached the apps at runtime — multer, socket.io-parser, qs
  and body-parser in the API, dompurify and mermaid in the docs site, next in
  both web frontends — so this closes the advisories in shipped code rather
  than in tooling alone.
- 604c528: Production pulls the `:master` images rather than `:develop`.

  The compose file named the `develop` tag, so the server would have deployed whatever last landed on
  the working branch. It follows `master` now, which is what the branch protection and the existing
  pull-request flow already treat as the released state.

  The server's checkout has to be on `master` too, not only its images: the nginx templates, the
  compose file, and the Taskfile are read from the working tree rather than from any image, so a
  checkout left on `develop` deploys images built from one commit alongside configuration from
  another.

- faf3ea9: Production deploys pull the images CI publishes instead of building them on the server.

  Each app service now names its GHCR image alongside its build context, so `task prod:deploy`
  fetches and restarts in a couple of minutes where a build on that box takes twenty-odd. `build:`
  stays for local work and for the fallback `prod:build`.

  The API image also drops six dead `ENV DATABASE_URL=$DATABASE_URL`-style lines. The `ARG` feeding
  them was declared in the `base` stage, which later stages do not inherit, so each expanded to an
  empty string — and the empty string is worse than nothing: compose passes `SHADOW_DATABASE_URL` by
  bare name specifically so an unset variable stays absent, and the image was making it present. The
  placeholder `postgresql://admin:admin@…` defaults went with them; they never reached the image, but
  a credential-shaped default in a Dockerfile invites someone to start relying on it.

- a5ceca4: Split the largest source files into focused modules without changing any
  behaviour. On the server the tracks service became separate query, upload, and
  streaming services, the audio pipeline separated encoding from upload and
  publication, the WebSocket gateway handed its connection and playback state to
  a registry, social sign-in moved to its own controllers on both sides, and the
  database seeder became one seeder per step. In the player the stream loader
  separated bitrate choice and the download loop from the MediaSource lifecycle.
  In the artist app the registration form, the header submenu, and the slide
  video hook each split along their own seams.
- 34776a7: Sentry events now carry a release and an environment. The release is the deployed
  version of the API, read from `SENTRY_RELEASE`, and the environment comes from
  `SENTRY_ENVIRONMENT` rather than from `NODE_ENV` alone, so a deploy target labels
  its own events instead of relying on one variable being set correctly. Trace and
  profile sampling now follows the resolved environment for the same reason. Both
  values fall back to their previous behaviour when unset, so nothing changes for a
  container started outside the deploy workflow.
- cebd6df: Sentry now initialises before the modules it is supposed to trace.

  `import './instrument'` sat fifteen lines down, after Nest, Express, helmet and the rest. Imports
  evaluate in source order and Sentry's instrumentation patches modules as `init()` runs, so every
  module already loaded was left untraced — which is most of the ones worth tracing. The error filter
  and `SentryModule` worked, so errors were reported; HTTP and database spans were not.

  It sits in its own import block, because Biome sorts within a block but preserves block order, and
  alphabetical sorting is what had pushed it to the bottom in the first place. Verified by running
  `biome check --write` over the file afterwards.

- e0fcd01: The reverse proxy no longer lets a client choose its own IP address. `/api` was
  hardened to send `X-Forwarded-For: $remote_addr`, but `/uploads` — which also
  reaches the API — set no proxy headers at all, so a client-supplied
  `X-Forwarded-For` passed through untouched and, with `TRUST_PROXY_HOPS=1`,
  became `req.ip`. Rate-limit buckets and audit IPs were spoofable on that route.
  The remaining blocks appended the client value instead of replacing it; since
  this nginx is the outermost proxy, every block now sends `$remote_addr`.
- dad1adc: An upload's path is built from the directory the server chose, not from the one the request
  carried.

  Every field on a Multer file object arrives with the request, `path` included — Multer writes the
  file, but the object describing it is request data. The cleanup and validation paths were derived
  from `dirname(file.path)`, so a value shaped by the request reached `open()` and `rm()` even though
  the filename itself was a generated UUID.

  Both halves are now server-owned: the directory is a named constant the upload interceptor also
  writes to, and the filename is the result of `basename()`. The destination literals moved next to
  the media helpers so the interceptor and the cleanup cannot drift apart.

  An existing spec asserted the avatar cleanup deleted `/tmp/avatar.png` — the path its fixture put on
  the file object. It now asserts the file under the avatar directory, which is what the code should
  always have removed.

- Updated dependencies [adc2b7c]
- Updated dependencies [abe3615]
  - @bitrate/converter@2.0.0
  - @bitrate/ncs-parser@1.0.0

## 0.1.0

### Minor Changes

- a43dc9e: Add a StorageService driver abstraction for track audio/HLS storage, selectable via the new `STORAGE_DRIVER` env var (`s3` or `local`, defaulting to `local`). The local filesystem driver provides full feature parity with the existing S3 driver, including HTTP Range-request progressive streaming, HLS playlist/segment serving, and a signed-URL equivalent of S3 presigned URLs. S3 credentials are now only required when `STORAGE_DRIVER=s3`, so a fresh clone can boot without configuring MinIO/AWS.

### Patch Changes

- eedc147: Add adaptive HLS audio variants, resilient hls.js playback, and an atomic BullMQ conversion pipeline with versioned jobs, retries, FFmpeg timeouts, stale-job protection, cleanup, and processing statuses.
- 7aaa0f4: Fix authorization and private playlist exposure, make cache fallbacks safe, repair auth request retries and media URLs, and restore Base UI wrapper compatibility.
- Updated dependencies [eedc147]
  - @bitrate/converter@1.1.0
