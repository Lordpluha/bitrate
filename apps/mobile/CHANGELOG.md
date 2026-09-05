# @bitrate/mobile

## 2.0.0

### Major Changes

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.
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
