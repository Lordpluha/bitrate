---
name: Bitrate for Artists — Pencil
description: The living-workspace design system of apps/web-artists and how the artist page designs are built on it.
---

# Bitrate for Artists — Pencil designs

The artist designs draw the shipped `apps/web-artists` look, the **living workspace**: a diagonal
canvas with three blurred brand washes (the aurora), translucent glass panels, a glass sidebar and
header, the gradient purple primary action and Poppins type. The flat September look this file used
to describe is retired; its pages are kept under `archive/` for reference only.

## Library

`design-system/artist.lib.pen`, imported by every page as `artist`. Pages paint only through its
components; colours are `$artist:--<role>` variables and themes use the library's Mode axis:
`theme: { "artist:Mode": "Dark" | "Light" | "Dim" }`.

- **Tokens come from code.** `pnpm design:tokens` (`scripts/sync-pen-tokens.mjs`) writes the shared
  roles plus `themes/components/artist-workspace.css` into the library: `--color-artist-*` →
  `--artist-*`, `--shadow-artist-*` → `--artist-shadow-*`, numeric `--artist-*` (glass opacity) →
  number variables. A missing colour is a code change first.
- **Components are generated.** `scripts/pencil-pages/artist-lib.mjs` (parts in
  `scripts/pencil-pages/artist-ws/lib-*.mjs`) builds the library and `registry-artist.json` (ids and
  overridable parts). Never edit the library by hand; add a component to its generator, regenerate,
  then use it.
- **Families** (one section each on the library page): foundations (type from 9 px eyebrow to the
  56 px hero, logo, Google/Facebook marks, avatar, skeleton, status bar); actions and status
  (primary/secondary/outline/ghost/danger buttons in three sizes, icon and social buttons, status
  chips, progress); forms (input, textarea, select, password, one-time code, consent checkbox,
  password rules, switches, option cards, tabs); bento tiles and rows; states (alerts, empty/error,
  skeletons); release workspace (header, stage stepper); public pages (auth card, panel, popover,
  toasts, legal blocks, landing header/dock/pills, studio window, journey step, person row, area
  chart, release sleeve, footer, phone menu); shell (sidebar, header, phone header and menu).

## Pages

One folder per screen in code: `<page>/<page>.pen`. Each file holds the desktop page in Dark, Light
and Dim, the phone page, then every state the code renders as a desktop + phone pair (see
`apps/docs/docs/brand/design.md` § 21). A state that exists on one side only says why in its frame
context.

| Area | Pages |
| --- | --- |
| Public | `landing`, `login`, `registration`, `forgot-password`, `reset-password`, `verify-email`, `legal`, `not-found`, `session-error` |
| Workspace | `dashboard`, `music`, `release-draft`, `release-review`, `release-deliver`, `release-launch`, `distribution`, `analytics`, `profile`, `settings` |
| Overlays | `workspace-search`, `notifications`, `account-switcher`, `mobile-menu` |
| Promotion (planned) | `release-promotion`, `promotion-post`, `promotion-profile`, `promotion-overview` |

Public, auth and promotion pages are on the artist library. `dashboard` and `music` still import the
player's library (`ds`) until they are redrawn; the other workspace and overlay pages are still to be
drawn.

- **Generated, not hand-drawn.** `node scripts/pencil-pages/run-artist.mjs pencil/web-artist-design
  [page …]` writes them from `scripts/pencil-pages/pages/artist/` (`index.mjs` plus one module per
  area: `public`, `workspace`, `release`, `insights`, `account`, `overlays`, `promotion`). Node ids are
  stable hashes, so an unchanged page regenerates byte for byte. `pnpm design:pages` runs everything.
- **Content is the code's.** English copy from `apps/web-artists/src/shared/i18n/messages/en/`; demo
  data from the views that show it (landing previews, legal documents); dashboard and analytics
  layouts from their default tile configs on the 12-column grid (73 px columns, 20 px gaps).
- **Only instances.** Every visible element is a library instance; a page adds layout-only flex frames
  and content overrides. The screen frame itself carries the canvas + aurora fill. Film grain, the
  landing's spotlight beams and grid, and motion have no Pencil equivalent and are not drawn.

## Archive

`archive/` is skipped by the checks. `archive/concepts/` holds pages with no screen in code (the old
wizard, tabbed settings, delivery and profile concepts, …), `archive/campaign-concepts/` the earlier
campaign ideas and `archive/landing-design/` the previous landing concept.
