# @bitrate/ui-react

## 1.0.0

### Major Changes

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

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.

### Minor Changes

- 10095e5: The design tokens are now plain CSS that you edit directly. `@spotify/tokens` (the values)
  and `@spotify/tokens-generator` (the CLI that turned them into stylesheets) are gone, along
  with `tokens.config.mjs` and the generated `tokens.manifest.json`. What was previously the
  generator's output — the Tailwind v4 `@theme` layers under `src/styles/` — is now the source
  itself: change a value, save, done. Nothing to regenerate, no config to keep in step with a
  value file, no build step between a colour and the utility that uses it.

  The role layout that split introduced survives. `themes.css` is an import-only barrel over
  `src/styles/themes/`: `base.css` for the shadcn role set, `global/*.css` for roles not tied
  to a component, and `components/<name>.css` — one file per component, with a shared file
  only where components are genuinely one family (`button.css`, `input.css`, `overlay.css`,
  `collection.css`). Each part carries both the dark declarations and its `:root.light`
  overrides, so a role's whole story is readable in one place, and component-scoped roles
  alias the semantic role they are built on rather than repeating a literal.

  The `design/Palette` and `design/Theme` Storybook pages read the stylesheets themselves
  through `src/styles/token-docs.ts`, so they still list exactly what the CSS declares — a
  role added to a part-file appears without anyone touching a story. The Storybook toolbar
  keeps its theme toggle, and `components.json` keeps the correction that pointed it at the
  files this package actually has.

  What is lost is the generator's cross-check: it refused to run when a role was claimed by
  two part-files, claimed by none, or missing from a theme. Those three invariants are now
  conventions, documented in the design-token contract.

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

- a57b74d: The `HoverCard` primitive ships with the coverage every other component in the
  package has: unit, integration, snapshot and screenshot specs plus a Storybook
  entry. It previously exported only the component and its barrel, so its
  `asChild` contract — which throws on anything but a single element — was
  untested.
- fcfda6d: The documentation and Storybook containers report their health correctly.

  Their healthcheck asked for `http://localhost:8080/`, and `/etc/hosts` in these images maps
  `localhost` to both `127.0.0.1` and `::1`. wget tries the IPv6 address first while `listen 8080`
  binds IPv4 only, so every check was refused and both containers sat marked unhealthy while serving
  their sites correctly to everyone. It asks for `127.0.0.1` now.

  This mattered beyond a misleading `docker ps`: the deploy gate treats an unhealthy container as a
  failed release, so it would have blocked deploys of two services that were working.

- c92e9fc: The documentation and Storybook sites stop redirecting visitors to an internal address.

  nginx builds an absolute `Location` from its own scheme and listening port. Inside these containers
  those are `http` and `8080`, so following any link without a trailing slash sent the browser to
  `http://docs.bitrate.me:8080/…` — a port that is not published and a scheme that is not encrypted.
  Every navigation link on a Docusaurus site is affected, which is why the sites looked fine on a
  direct URL and broke as soon as anyone clicked anything.

  `absolute_redirect off` makes the `Location` relative, so the browser resolves it against the URL
  it actually requested and the edge proxy's scheme and host survive.

- 10095e5: Added the four placeholder banner images the avatar, carousel, and empty stories have
  imported since they were written. The files were never committed, so `storybook build`
  failed on eleven unresolved imports and the Storybook could not be built at all.
- 10095e5: Bumped Vite from 8.0.16 to 8.2.2 in every workspace on that major.

  The bump was prompted by `build.emptyOutDir` appearing not to clear `packages/ui-react/dist`,
  but that turned out to be correct behaviour rather than a bug, and 8.2.2 behaves the same:
  Vite empties the directories rollup actually writes (`dist/esm`, `dist/cjs`) and not the
  nominal `build.outDir`. `dist/types` comes from `vite-plugin-dts`, which is not a rollup
  output, so nothing built in ever clears it — that is what `scripts/clean-dist.mjs` is for,
  and both it and `vite.config.ts` now say so.

## 0.0.2

### Patch Changes

- 7aaa0f4: Fix authorization and private playlist exposure, make cache fallbacks safe, repair auth request retries and media URLs, and restore Base UI wrapper compatibility.
