# @bitrate/desktop

## 1.0.0

### Major Changes

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

### Minor Changes

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

- 10095e5: Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
  the Node version CI already built and tested against. Previously CI ran on Node 24 while
  each shipped container ran Node 22, so no pipeline exercised the runtime that actually
  served traffic.

### Patch Changes

- 10095e5: Bumped Vite from 8.0.16 to 8.2.2 in every workspace on that major.

  The bump was prompted by `build.emptyOutDir` appearing not to clear `packages/ui-react/dist`,
  but that turned out to be correct behaviour rather than a bug, and 8.2.2 behaves the same:
  Vite empties the directories rollup actually writes (`dist/esm`, `dist/cjs`) and not the
  nominal `build.outDir`. `dist/types` comes from `vite-plugin-dts`, which is not a rollup
  output, so nothing built in ever clears it — that is what `scripts/clean-dist.mjs` is for,
  and both it and `vite.config.ts` now say so.
