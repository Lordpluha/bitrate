# Living artist workspace: behavior and implementation

## Goal and boundaries

Make the web-artists workspace feel alive and let each artist arrange it. Affected
workspaces: `apps/web-artists`, `apps/api` (layout storage), `packages/contracts`
(regenerated), `packages/tailwind` (artist tokens). The `@bitrate/player` package is used
as is. Excluded: the listener map (see Deferred), free canvas positioning, interface
sounds (removed).

## Observable behavior and contracts

- **Atmosphere.** An animated aurora sits behind the workspace; top-level panels are
  translucent; a fixed film-grain layer softens gradients. On a release page the aurora
  takes its colors from the release artwork, falling back to brand colors.
- **Panels.** Panel headings carry an icon. On fine pointers a soft light follows the
  cursor across panel borders. Statuses that are still changing pulse or spin.
- **Navigation.** The active sidebar item is marked by a pill that slides between items.
- **Now playing.** One player serves the whole workspace and keeps playing across routes.
  It floats as a pill at the bottom, expands on hover or focus, and shows the track's
  waveform as its progress. Track rows and catalogue rows start it; rows draw their own
  waveform with the played part highlighted. Media keys work through media session.
- **Release page.** The header scrolls with the page (the sticky bar was dropped on
  2026-11-03 at the user's request); the artwork tilts toward the pointer; a vinyl slides out of the artwork while one of the release's tracks plays; a
  premiere countdown shows while a future `scheduledAt` exists.
- **Dashboard.** Tiles form a bento grid: current release with a stage ring and countdown,
  attention, releases, coming up, activity, listening data with numbers that roll up. A new
  artist sees a kinetic poster with one Create release action. Next premiere counts down to
  the soonest future moment and shows the cover and title of each release landing at that
  exact moment; later dates stay in Coming up, which lists date and time in UTC with cover
  and status. While the list has room, a dashed slot below it leads to planning the next
  release (a two-week day strip was tried there and dropped on 2026-11-04 at the user's request).
  Your catalogue shows totals, a status share bar and a fan of covers; Your releases shows two-line rows with status and last update.
- **Shell.** Header and sidebar are translucent over the aurora, separated by hairlines; the header is 4rem tall with one control height and radius.
- **Distribution.** One delivery matrix of releases against stores; a store only reads as sent once it reports so.
- **Analytics.** A quiet analyzer photograph behind the title, track artwork in Top tracks, per-figure hues from the chart roles.
- **Profile.** The public card leads the page with image uploads on it; details and links sit below in two panels.
- **Release colour.** The header takes a wash of the cover, panels carry a `data-hue`, the waveform runs along the chart roles.
- **Catalogue.** Releases stay a table; the masonry gallery was removed on 2026-11-03 at
  the user's request.
- **Celebrations.** A short confetti burst plays once when the artist first sees a release
  approved or released, remembered per release in this browser.
- **Customizable layouts.** Dashboard, Analytics and the release Draft stage have a
  Customize button in the page heading. In customize mode tiles can be reordered by drag or
  keyboard, resized (S/M/L where the tile allows it) and hidden or shown again; Done saves,
  Reset restores the default. Unknown or missing tiles in a stored layout are dropped or
  appended, so new tiles appear without breaking old layouts.
- **API.** `GET /api/v1/artist-workspace/layouts/{page}` returns
  `{ page, tiles: [{ id, size, hidden }], updatedAt }` or `tiles: []` when the artist has
  none; `PUT` replaces it (max 24 tiles, unique ids, `size` one of `S|M|L`); `DELETE`
  resets it. `page` is one of `dashboard|analytics|release-draft`. All routes need the
  artist session and only touch the caller's own layout.
- Every animation respects `prefers-reduced-motion` and the workspace Motion setting.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | Layout routes validate input, scope to the caller and round-trip a layout | API unit specs | Pass: `artist-workspace.service.unit-spec.ts`, 9 tests |
| AC-2 | Stored layouts merge with the page's default tiles (unknown dropped, new appended, sizes clamped) | web-artists unit spec | Pass: `layout.unit-spec.ts` |
| AC-3 | Customize mode reorders, resizes and hides tiles and persists through the API | Manual in the running app | Pending |
| AC-4 | Playback continues across route changes; one track plays at a time | Manual in the running app | Pending |
| AC-5 | All workspace motion stops with Motion → Reduced | Manual | Pending |
| AC-6 | Type checks, lint and scoped unit tests pass for api and web-artists | Commands in the PR | web-artists check-types, Biome, 177 unit + 12 int tests, knip pass; player browser spec and svelte-check pass; API `check-types` deferred (memory pressure) |

## Decisions and approval

Confirmed by the user in the session of 2026-11-03: all 19 ideas from the idea board ship
in one PR (PR size limits waived for this task); customizable layouts on Dashboard,
Analytics and the release Draft stage; reorder, size and hide are all allowed; layouts are
stored in the API; a Customize mode with Done; no commit until the user asks. Panel
headings gain icons. The interview ran manually because the grilling skill is not
installed; the user waived the skill requirement.

Implementation choices: artwork colors are sampled in the browser (the API serves
`/static` with CORS), so no migration or image dependency is needed; drag and drop uses
`@dnd-kit` for keyboard and screen-reader support.

## Deferred

- **Listener map.** A dot map where cities pulse by listener count. Needs a geo source for
  plays (IP lookup at play time or the listener's profile country) and an aggregate in the
  analytics API. Not started.

## Implementation plan

1. API: `ArtistWorkspaceLayout` model and migration, `artist-workspace` module with
   GET/PUT/DELETE, Swagger decorators, unit specs; regenerate contracts.
2. web-artists shared: now-playing provider (headless `<bitrate-player>`) and island;
   cover palette; spotlight, grain, status motion, nav pill, celebrations, heading icons.
3. Layout system: `features/workspace-layout` (merge logic with unit spec, query hooks,
   customize mode, sortable grid), applied to Dashboard, Analytics and Draft.
4. Dashboard tiles (bento, ring, countdown, counters, poster), release header (sticky,
   tilt, vinyl, countdown), catalogue gallery.
5. Checks: api and web-artists check-types, lint, scoped unit tests; manual pass in the app.
