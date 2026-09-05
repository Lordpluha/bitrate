# @bitrate/web-player

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

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.
- aa0e46b: Loading any page dropped most of its JavaScript and fonts. Next.js requests dozens of
  content-hashed chunks at once, which tripped nginx's page rate limit — and nginx answers a
  limited request with a 503 and an HTML body, so the browser reported `Refused to execute script
… MIME type ('text/html')` instead of anything about throttling. Build output now has its own
  location, outside the limit, and is served with a one-year immutable cache.

### Minor Changes

- ebcb82d: The Bitrate mark replaces the previous product's logo everywhere it was still rendering.

  `assets/icons/logo-icon.svg` now holds the supplied vector, so `LogoIcon` carries the real mark
  and every screen that already used it — six auth screens across both apps — picked it up without
  a call-site change. svgr expands the gradient's six stops into props with the designer's values as
  defaults, which means the two screens passing `primaryColor="#FFF"` would have recoloured only the
  first stop into a white-to-purple ramp; they now render the mark as designed.

  Removed: `spotify-logo.svg`, `logo.svg`, `artistlogo-icon.svg`, `footer-logo.png`, and the
  `SpotifyLogo`, `Logo`, and `ArtistlogoIcon` components generated from them. **`SpotifyLogo` and
  `ArtistlogoIcon` are no longer exported** — the header, both footers, and the artists lockup render
  `LogoIcon` instead. The header's accessible name also read "Spotify Home".

  The wordmark is not in this change. It exists only as pixels inside the social cards, so the
  lockups render the mark alone until a vector arrives; the slots are square rather than 112×32.

  Every icon — the multi-size favicon, `apple-icon`, and the PNG manifest icons — is rasterised from
  that vector now instead of cut from the social card, and both apps also serve `icon.svg` directly
  for browsers that prefer it.

- 29a1bea: Added the artist page with follow, popular tracks and discography, a real playback
  queue with a dedicated screen, three-state repeat, a lyrics screen, and artists in
  search results behind working filter tabs. Settings now persist across reloads, and
  the compact-library and now-playing-panel switches actually change the interface.
  Replaced the hardcoded credits block with the playing track's real artist, connected
  the previously dead "Popular artists" section and home tabs, added global playback
  shortcuts, error/not-found boundaries, and a PWA manifest with robots and sitemap.
- f72b2f0: Listening history is now recorded. A track played for more than fifteen seconds
  is written to the history, which had never happened — the mutation existed but
  nothing called it, leaving the history table empty for every user and "Top
  artists this month", "Top tracks this month" and Recents permanently blank.

  The library sidebar filter chips now actually filter. They previously kept their
  selection in local state that nothing consumed, and an active chip painted white
  text on a white background. Followed artists and saved episodes join playlists
  in the list, each linking to its own screen. The "Albums" chip was removed
  because no per-user saved-album endpoint exists behind it.

  The profile gained a "Following artists" section, so artists you follow are
  visible somewhere, and its sections are evenly spaced instead of colliding.

  The avatar picker accepts a dropped image and no longer shows the browser's
  own locale-specific "no file chosen" label, which contradicted the language
  selected in the app.

- f72b2f0: The light theme reads as a designed counterpart to the dark one rather than an
  inversion of it. The dark theme builds depth by floating lighter panels on a
  near-black page; the light theme had flipped that relationship, making the page
  pure white and the panels grey, so nothing could sit above anything and every
  screen collapsed into one flat sheet. The page now recedes to a soft neutral,
  panels come forward in white, hairlines carry the edges where white meets white,
  and body copy uses a deep ink instead of full-strength black.

  The home hero's ambient wash became a theme token, so it stays moody in the dark
  and turns into a pale tint in the light instead of a saturated purple slab. The
  gradients over the profile and playlist action bar, the carousel arrows, the
  active library filter chip and the empty Liked Songs message no longer assume a
  dark background.

  Light-theme type was also toned down. Dark text on a light ground is rendered
  with subpixel antialiasing that thickens every stroke, so the weights tuned for
  the dark theme read as heavy-handed here: grayscale smoothing and a one-notch
  step down across the bold range restore the intended feel without touching the
  dark theme. Body copy sits on a soft graphite rather than near-black, and the
  profile avatar's surround follows the theme instead of staying a dark disc.

- 10095e5: Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
  the Node version CI already built and tested against. Previously CI ran on Node 24 while
  each shipped container ran Node 22, so no pipeline exercised the runtime that actually
  served traffic.
- b6e5b2b: Both apps now carry the Bitrate mark as their icon, and the artists portal's primary action is
  the brand purple.

  The tab icon was a 32×21 crop of the mark — the wrong aspect ratio, no ground, and unreadably
  soft at any size a browser actually renders. It is replaced by a multi-size favicon (16/32/48),
  an `apple-icon`, and PNG manifest icons, all cut from the mark in the social card. This also
  retires `public/icon.svg`, which the PWA manifest still pointed at and which still held the
  previous product's mark rather than ours.

  The artists portal painted its submit buttons and the registration progress bar with a fixed
  `green-400` from the palette instead of the `primary` role, so repointing the brand colour to
  purple never reached them — they stayed mint green through the whole rebrand. They use the
  `primary` Button variant now, which also gives them the hover and active states the fixed fill
  had no way to express. The OAuth buttons keep their white `artistCard` variant. The browser tab
  also read `@bitrate/artists`, the raw package name.

- f72b2f0: Playback now opens at the quality the connection actually supports. Every track
  previously started on the lowest rung and climbed, because each track built a
  brand-new bandwidth estimate from zero — so even on fast connections the first
  ~20 seconds played at 128k. The measured estimate is now remembered across
  tracks and reloads and picks the opening rendition, while a genuinely cold start
  with nothing measured still opens low. A remembered estimate older than six
  hours is discarded rather than trusted.
- 10095e5: Every component now paints with design tokens instead of Tailwind's built-in colour scales.
  Twenty-two of the twenty-nine `ui-react` components were styled with `slate-*` greys, which
  the token pipeline never sees: `gen:tokens` does not emit them and `:root.light` never
  overrides them, so those components ignored the theme toggle entirely. They were also using
  the `dark:` variant, which compiles to a `prefers-color-scheme` media query in this repo and
  therefore followed the operating system rather than the theme the app had applied — a light
  app on a dark desktop rendered dark menus, inputs, and tooltips.

  Both are gone. Components now use semantic roles (`bg-muted`, `text-muted-foreground`,
  `border-border`, `ring-ring`, `bg-primary`, `bg-destructive`, `bg-popover`), the library
  sidebar's cover washes use the previously unused `chart-1`…`chart-5` decorative roles, and
  no first-party UI source carries a `dark:` variant. Four latent defects surfaced and were
  fixed along the way: the secondary button painted dark text on a dark fill in the light
  theme, `text-textContrast` named a CSS variable that does not exist so the contrast input and
  contrast button had no text colour at all, and `input-group` and `kbd` each carried a
  doubled `dark:dark:` prefix that produced a dead class.

  A new `pnpm check:tokens` gate fails the build on any stock Tailwind colour in
  `apps/web-player/src`, `apps/web-artists/src`, or `packages/ui-react/src`, so the regression
  cannot return silently.

### Patch Changes

- f72b2f0: The artist page's "About" card now lays the listener count and biography over
  the portrait instead of splitting them into an image and a separate grey strip,
  matching how the block is presented in the real product. The biography is
  clamped to three lines with a show more/less toggle, and the card grows with an
  expanded biography rather than clipping it.
- 73bda26: The artists portal has real page metadata, and both apps hand iOS an icon it can actually use.

  Its browser tab read `@bitrate/artists` and its description was still `Generated by create next
app` — the string Next's template ships, which is what a search result or a shared link would have
  shown. Both now come from a `SITE_NAME`/`SITE_DESCRIPTION` pair mirroring the web player's, and the
  title gains the same `%s · Bitrate for Artists` template so nested pages read correctly.

  Both apps declared `apple-touch-icon` as the SVG. iOS ignores an SVG there and screenshots the page
  instead, so adding either to a Home Screen produced a thumbnail of the page rather than the mark;
  they point at `apple-icon.png` now.

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

- 10095e5: An unsupplied Docker build argument no longer produces a confusing "Invalid URL"
  failure. A Dockerfile's `ENV X=${X}` sets the variable to an empty string when
  its `ARG` was not passed, so `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` and
  `API_URL` arrived present-but-empty and failed the URL format check instead of
  the "required in production" check that names them. Empty is now treated as
  absent, which also fixes the case where the build succeeded without enforcement:
  `API_URL` of `''` is not nullish, so the `/api-media` rewrite resolved to a
  relative destination rather than falling back to `http://localhost:3000`.
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

- 208996d: The web-artists container reported unhealthy while serving correctly. Its root path answers 307
  to `/auth/login` because the portal is behind auth, and the health check demanded exactly 200.
  It now accepts any status below 500 — the check is meant to prove the server is up and routing,
  not that a given page is public.

  All three checks also lacked an error handler on the request, so a refused connection surfaced as
  an unhandled `error` event and a stack trace instead of a clean failure.

- c4762b7: Pinned the vulnerable transitive dependencies flagged by Dependabot to their
  patched releases through pnpm overrides, and moved Next.js to 16.2.11. The
  affected packages reached the apps at runtime — multer, socket.io-parser, qs
  and body-parser in the API, dompurify and mermaid in the docs site, next in
  both web frontends — so this closes the advisories in shipped code rather
  than in tooling alone.
- f72b2f0: The next/previous track hover cards space the cover art away from the label
  instead of butting them together. Dragging a sidebar edge now tracks the pointer
  directly: the 300ms grid transition that makes the collapse/expand buttons
  smooth was also animating every drag frame, so the sidebar trailed the cursor.
  The main footer's Facebook link uses the glyph icon matching the Twitter and
  Instagram marks instead of a filled blue disc.
- 82cf091: The FSD layer guard now enforces the rule it claimed to. Its restricted-import
  list held exact specifiers such as `@/entities`, but `tsconfig` maps `@*` to
  `./src/*`, so `@entities/Player` and any deeper path resolved while matching
  nothing — the lint rule reported violations only for an import form the codebase
  never uses. It now matches both alias forms at any depth.

  With the guard working, seventeen genuine violations surfaced and are fixed: the
  Media Source Extensions playback subsystem lived in `shared/` while importing
  from `entities/Player`, and two files in `shared/hooks/` were re-export shims for
  `entities/Track`. The subsystem moved into the Player entity that owns it, the
  shims are gone, and its one remaining cross-entity dependency — a domain type it
  used for two fields — is now a narrow type the Player entity declares itself.

  Navigation, styling and settings fixes ride along: the mobile bottom bar is built
  from links rather than buttons, so middle-click and open-in-new-tab work again;
  the settings dropdown no longer becomes keyboard-unreachable when it is given an
  empty option list; overlays share one z-index scale instead of eleven ad-hoc
  values with `!important` escapes; and raw palette colours were replaced with
  design tokens.

- 8ef2285: A stalled audio fragment request no longer ends playback in silence. The
  per-attempt timeout aborted its own `AbortController`, and the retry backoff
  then waited on that same already-aborted signal — so it resolved immediately and
  the request returned "superseded" on the first attempt. The buffer filler reads
  that as a benign cancellation, so it stopped without reporting an error, the
  250 ms refill tick restarted it forever, and neither the error toast nor the
  CMAF-to-HLS fallback ever fired. The configured retry budget was dead for every
  timeout. Backoff now waits on a plain delay and checks currency afterwards, and
  an exhausted request throws so the caller can surface it.

  Recovering from a full media buffer also works in the first 30 seconds of a
  track: the quota handler previously only trimmed behind the playhead, which
  frees nothing that early, so the track dropped out of Media Source Extensions
  entirely. It now falls back to evicting buffered media ahead of the playhead,
  keeping a safety margin around the current position.

  Skipping backwards from the first track no longer wraps to the end of the queue
  when repeat is off, matching how skipping forward from the last track behaves.

- a5ceca4: Split the largest source files into focused modules without changing any
  behaviour. On the server the tracks service became separate query, upload, and
  streaming services, the audio pipeline separated encoding from upload and
  publication, the WebSocket gateway handed its connection and playback state to
  a registry, social sign-in moved to its own controllers on both sides, and the
  database seeder became one seeder per step. In the player the stream loader
  separated bitrate choice and the download loop from the MediaSource lifecycle.
  In the artist app the registration form, the header submenu, and the slide
  video hook each split along their own seams.
- 4c0b453: Aligned the web player with the regenerated OpenAPI contract: track responses now validate the `playbackVersion`, `fragmentTimescale`, and `durationTicks` fields the API already returns, and the user search request no longer sends invalid path parameters for an endpoint that only accepts query parameters.
- 060d8ba: The route screenshot baselines carry the Bitrate mark, and the gate that guards them can now see a
  change that size.

  `maxDiffPixelRatio: 0.02` allowed 18,000 differing pixels on a 1280×720 shot — eighteen times the
  area of the header logo. Replacing the logo outright therefore passed the screenshot suite without
  a single failure, and `--update-snapshots` declined to rewrite the baselines because it saw no
  difference worth recording. Both still showed the previous product's logo.

  Consecutive runs are byte-identical here, verified down to a ratio of zero, so the threshold is now
  0.0004 — roughly 370 pixels of headroom for antialiasing, comfortably under anything logo-sized. An
  8-pixel change to the logo's height fails both specs under the new value and passes under the old
  one.

- f72b2f0: Search results appear again. The client schema required the singular type name
  ("playlist") while the API labels each result with the plural form it was
  queried by ("playlists"), and required all four result buckets even though the
  API returns only the ones asked for. Either mismatch rejected the whole
  response, so a search that found something rendered as "No results found" while
  a search that genuinely found nothing looked fine.

  The profile grids use auto-fill like every other grid in the app instead of
  auto-fit, which had stretched a couple of followed artists across half the page.

- f72b2f0: Settings no longer stretch the page past the viewport. The avatar picker's
  visually hidden file input is absolutely positioned, and with no positioned
  ancestor it was laid out against the page root, escaping the app shell's
  overflow clipping and leaving several thousand pixels of unpainted space below
  the interface.

  The Playback section drops the "Download the free app" promo, which advertised a
  desktop app that does not exist and whose button had no behaviour.

  Liked Songs uses a vector cover instead of a 48x48 JPEG that was being upscaled
  roughly sixfold wherever it appeared.

- 3c3ad99: Corrected the deployment URLs baked into the published container images. CI built both
  frontends against `http://localhost:3000` and a stale pre-rebrand Vercel host (web-player)
  or no API URL at all (web-artists), and because `next build` inlines every `NEXT_PUBLIC_*`
  value into the client bundle, no published image could ever reach the production API. The
  build now defaults to the real origins and keeps the Actions variables as an override.
- 10095e5: Bumped Vite from 8.0.16 to 8.2.2 in every workspace on that major.

  The bump was prompted by `build.emptyOutDir` appearing not to clear `packages/ui-react/dist`,
  but that turned out to be correct behaviour rather than a bug, and 8.2.2 behaves the same:
  Vite empties the directories rollup actually writes (`dist/esm`, `dist/cjs`) and not the
  nominal `build.outDir`. `dist/types` comes from `vite-plugin-dts`, which is not a rollup
  output, so nothing built in ever clears it — that is what `scripts/clean-dist.mjs` is for,
  and both it and `vite.config.ts` now say so.

- Updated dependencies [adc2b7c]
- Updated dependencies [ebcb82d]
- Updated dependencies [adc2b7c]
- Updated dependencies [10095e5]
- Updated dependencies [a2c7d43]
- Updated dependencies [a57b74d]
- Updated dependencies [f72b2f0]
- Updated dependencies [fcfda6d]
- Updated dependencies [e4c56e0]
- Updated dependencies [c92e9fc]
- Updated dependencies [10095e5]
- Updated dependencies [10095e5]
- Updated dependencies [10095e5]
  - @bitrate/ui-react@1.0.0

## 0.1.0

### Minor Changes

- eedc147: Add adaptive HLS audio variants, resilient hls.js playback, and an atomic BullMQ conversion pipeline with versioned jobs, retries, FFmpeg timeouts, stale-job protection, cleanup, and processing statuses.

### Patch Changes

- 7aaa0f4: Fix authorization and private playlist exposure, make cache fallbacks safe, repair auth request retries and media URLs, and restore Base UI wrapper compatibility.
- Updated dependencies [7aaa0f4]
  - @bitrate/ui-react@0.0.2
