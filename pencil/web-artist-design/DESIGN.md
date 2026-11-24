---
name: Bitrate for Artists — Pencil
description: The living-workspace design system of apps/web-artists and how the artist page designs are built on it.
---

# Bitrate for Artists — Pencil designs

The artist designs draw the shipped `apps/web-artists` look, the **living workspace**: a diagonal
canvas with three blurred brand washes (the aurora), translucent glass panels, a glass sidebar and
header, the gradient purple primary action and Poppins type. Older flat concepts are kept under
`archive/` for reference only.

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
  overridable parts). Never edit the library by hand: add a component to its generator, regenerate,
  then use it. Every component appears on the library page in one section — foundations, actions
  and status, forms, bento tiles and rows, states, release workspace (header, `Release/Stages`, the
  promotion pages' five-stage `Release/Stepper`), public pages, workspace pages, release stages,
  account and insights, shell.

## Pages

One folder per route: `<page>/<page>.pen`, all generated from `scripts/pencil-pages/pages/artist/`.

| Page | Route | Module |
| --- | --- | --- |
| `landing` | `/` | public |
| `login` | `/login` (incl. 2FA step, `?addAccount`, `?error=`) | public |
| `registration` | `/registration` (two steps) | public |
| `forgot-password`, `reset-password` | `/forgot-password`, `/reset-password?token=` | public |
| `verify-email` | `/verify-email` | public |
| `legal` | `/legal/$slug` | public |
| `not-found`, `session-error` | any unknown path; failed session check | public |
| `dashboard` | `/dashboard` | workspace |
| `music` | `/dashboard/music` | workspace |
| `distribution` | `/dashboard/distribution` | workspace |
| `release-draft`, `release-review`, `release-deliver`, `release-launch` | `/dashboard/music/$releaseId?step=` | release |
| `analytics` | `/dashboard/analytics` | insights |
| `profile`, `settings` | `/dashboard/profile`, `/dashboard/settings` | account |
| `workspace-search`, `notifications`, `account-switcher`, `mobile-menu` | overlays on every `/dashboard` page | overlays |
| `release-promotion`, `promotion-post`, `promotion-profile`, `promotion-overview` | planned | promotion |

## States

Each file holds the desktop page in Dark, Light and Dim, then the phone page in Dark, Light and Dim
(in that order), then every state the code renders once, in Dark, as a desktop + phone pair (`apps/docs/docs/brand/design.md` § 21): loading skeletons, errors
with their retry, empty and first-use, not found / unavailable, validation and submission, locks,
and every dialog, menu and popover the page opens. A state that exists on one side only (Customize
mode, the phone menu drawer) is drawn on that side and says why in its frame context.

- **Layout.** Public pages sit on the canvas without the shell. Workspace pages are bento tiles on
  the 12-column grid (73 px columns, 64 px rows, 20 px gaps) in the default order of the code's tile
  configs, stacked on phones. Overlays and dialogs are drawn in flow over the page they open on.
- **Content is the code's.** English copy from `apps/web-artists/src/shared/i18n/messages/en/`; demo
  data from the views that show it (landing previews, legal documents, dashboard and analytics
  previews) and a small demo catalogue in `pages/artist/workspace/demo.mjs`.
- **Only instances.** Every visible element is a library instance; a page adds layout-only flex frames
  and content overrides (text, cover images). The screen frame itself carries the canvas + aurora
  fill. Film grain, the landing's spotlight beams and grid, and motion are not drawn.

## Regenerating

```sh
node scripts/pencil-pages/artist-lib.mjs pencil/web-artist-design/design-system/artist.lib.pen scripts/pencil-pages/registry-artist.json
node scripts/sync-pen-tokens.mjs                # writes the code's colours into the library
node scripts/pencil-pages/run-artist.mjs pencil/web-artist-design [page …]
node scripts/sync-pen-tokens.mjs --check        # tokens, instances-only and flex rules
```

`pnpm design:pages` runs every library and page generator. Node ids are stable hashes, so an
unchanged page regenerates byte for byte. After changing a `.pen` on disk, reload the Pencil editor
before editing through the MCP.

## Archive

`archive/` is skipped by the checks. `archive/concepts/` holds pages with no screen in code (the old
release wizard, tabbed settings, delivery and profile concepts, …), `archive/campaign-concepts/` the
earlier campaign ideas, `archive/landing-design/` the previous landing concept and
`archive/impeccable-dark/` / `archive/impeccable-white/` the outdated Impeccable design settings. Every
web-artists design lives under `pencil/web-artist-design/`, one folder per page.
