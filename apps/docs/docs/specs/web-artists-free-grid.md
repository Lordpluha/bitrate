# Free-grid workspace layouts: behavior and implementation

> Status: **implemented on 2026-11-12; PR preparation authorized** (branch `feat/web-artists-free-grid`,
> API and web-artists are submitted separately). The owner confirmed the decisions and the plan in chat
> on 2026-11-12. Clickable prototype: <https://claude.ai/artifact/MCLXXM9akb3DhJ8Y75fBoT>
> (the owner's verdict: "much better, port it to the project").

## Goal and boundaries

Replace the order-based customization of the web-artists Dashboard and Analytics with a free
12-column grid. The artist places a tile at any cell and can leave empty space. Tiles never
overlap and have no layers. This supersedes the "Customizable layouts" part of
[web-artists-living-workspace](./web-artists-living-workspace.md).

Affected workspaces:
- `apps/api` (`artist-workspace` layout DTO; no migration, `tiles` is JSON);
- `packages/contracts` (regenerated);
- `apps/web-artists` (`features/workspace-layout`, uk/pl/en).

Out of scope: other pages (the release page and the profile may come later); a free canvas
with overlap; editing on phones; real-time collaboration.

## Observable behavior and contracts

- **Grid.** 12 columns and fixed-height rows (prototype: 56 px row, 12 px gap). Each tile has
  `x`, `y`, `w` and `h` in cells, plus a per-tile minimum size.
- **Drag.** In edit mode, a tile moves by dragging anywhere on it. A dashed ghost shows where
  it will land.
  1. The tile keeps its size when that spot is free.
  2. Otherwise it shrinks to the largest free rectangle at that spot, but not below its
     minimum. The ghost then says "will shrink to fit".
  3. Only when even the minimum does not fit, overlapped tiles are pushed down, recursively.
- **Resize.** Every edge and corner resizes in whole cells; the opposite edges stay put. Sizes
  are clamped to the minimum and to the grid. Growing right or down pushes overlapped tiles
  down; growing left or up stops at the nearest tile. (The owner asked for all eight handles on
  2026-11-12 after trying the build; the approved plan had only the bottom-right corner.)
- **Empty space stays.** Nothing floats up on its own. A "Pull up" action compacts every tile
  upward once, in reading order.
- **Canvas height.** It follows the lowest tile. Edit mode adds two empty rows below so the
  canvas can grow while dragging; leaving edit mode trims them.
- **Edit mode.** A Customize button opens it. Done saves, Reset restores the default. There are
  no width or height selectors and no cell numbers. Keyboard: arrows move the focused tile,
  Shift + arrows resize it.
- **Tile drawer.** In edit mode, the tile's × button removes it to an "Add tile" drawer. The
  drawer sits above the full-width grid. Its + button puts the tile back at the first free spot that fits its default size, from
  the top left. Each tile appears at most once.
- **Phone (< 640 px, or touch-only).** A separate read-only view: tiles in one column, ordered
  by `y`, then `x`, at natural height. The desktop layout is kept unchanged.
- **Motion.** Tiles ease between cells. Both easing and the ghost respect
  `prefers-reduced-motion` and the workspace Motion setting.
- **API.** `PUT /api/v1/artists/me/workspace/layouts/{page}` accepts optional integer `x`
  (0–11) and `y` (0–199) on each tile, next to the existing `columns`/`rows`, which carry the
  width and height. `GET` returns them when stored. Old layouts without `x`/`y` stay valid, and
  the client converts them by flowing tiles left to right, top to bottom, in stored order.
  `x + columns` must not exceed 12. Hidden tiles keep their entry with `hidden: true`.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | `PUT` stores and `GET` returns `x`/`y`; out-of-range or overflowing `x + columns` → 400; old payloads without them still pass | API int/unit spec of the layout controller | Pass: `artist-workspace.service.unit-spec.ts` (schema + service, 16 tests); the controller's `ZodValidationPipe` turns a failed parse into 400. Overflow is checked when both `x` and `columns` are sent |
| AC-2 | Placement keeps the size when free, shrinks to the free rectangle not below the minimum, else pushes down recursively | web-artists unit spec of the pure layout model | Pass: `model/grid.unit-spec.ts` (`placeTile`) |
| AC-3 | Resize clamps to minimum and 12 columns and pushes overlapped tiles down; Pull up compacts in reading order | model unit spec | Pass: `model/grid.unit-spec.ts` (`resizeTile`, `compactLayout`), `ui/LayoutGrid.unit-spec.tsx` (Pull up) |
| AC-4 | Legacy layout (order, size/columns/rows, hidden) converts to coordinates without overlap | model unit spec | Pass: `model/layout.unit-spec.ts` (`fromStoredLayout`, `toStoredLayout`) |
| AC-5 | Drawer removes and re-adds tiles at the first free spot; Reset restores the defaults | component unit spec | Pass: `ui/LayoutGrid.unit-spec.tsx` |
| AC-6 | Keyboard move and resize; phone view is one read-only column in reading order | component unit spec | Pass: `ui/LayoutGrid.unit-spec.tsx`; also checked in headless Chromium against the dashboard fixture (drag with ghost, Shift + arrows, 390 px stack, no horizontal scroll) |
| AC-7 | Types, Biome and knip pass for api, contracts and web-artists | scoped checks | Pass: `tsc` for api (`--force`), web-artists and contracts; Biome on changed paths; knip for api, web-artists and contracts |

## Decisions and approval

Interview answers on 2026-11-12:
- free grid with gaps;
- shrink to fit an empty spot that is too small;
- empty space stays, the canvas grows and its empty bottom is trimmed;
- light edit mode without selectors;
- tile drawer;
- the same pages as before (Dashboard and Analytics);
- a separate stacked phone layout;
- a prototype first.

The owner approved porting the prototype and requested pull requests on 2026-11-12.

## Implementation notes

Choices made while implementing, within the approved decisions:
- The model works on placed tiles only; a tile not on the grid is in the drawer. The API
  stores drawer tiles with `hidden: true`, their default size and no `x`/`y`.
- Placement reports "will shrink to fit" against the requested size, so a tile clipped at
  the right edge also shows the badge. `pushDown` stays internal and is covered through
  `placeTile`, `resizeTile` and `resizeTileFrom` (edge and corner handles).
- Each tile in edit mode has a transparent full-size "Move {tile}" button that takes focus
  and the arrow keys; dragging works from anywhere on the tile. A polite status line
  announces the new cell and size after each key press.
- Phones and touch-only screens (`max-width: 639px`, or `hover: none` with a coarse
  pointer) hide the Customize button and show the stacked view.
- Default tile sizes (cells): Dashboard current 8×6, attention 4×6, numbers 8×3,
  premiere 4×3, releases 8×6, coming up 4×6, activity 8×4, listening 4×4; Analytics 8×6
  and 4×6 for each pair. Content taller than its tile scrolls inside it.
- `@dnd-kit/*` was removed from web-artists; nothing else used it. The static preset grid
  CSS stays for the Draft stage and the Studio previews.

## Implementation plan

Port the algorithm from the prototype's `place`, `pushDown`, `compact` and `firstFree` functions,
which are inline in the artifact above. Reimplement them typed and tested; do not copy the
untyped code.

1. **API** (TDD at the layout controller/DTO seam). Add `x`/`y` to the zod tile schema with the
   rules above and a refine for `x + columns ≤ 12`. Update the Swagger entity. Add the fields as
   optional in the contract so the current web-artists keeps type-checking (lesson from #528).
   Regenerate `packages/contracts` from a running build: throwaway Postgres and Redis on spare
   ports, API on 3100/3107, never the developer's services. API checks: scoped jest
   (`--maxWorkers=2`, including all of `src/modules/admin` coverage specs if routes change),
   `tsc --force`, Biome, `lint:data-ownership`.
2. **web-artists model** (`features/workspace-layout/model`). Pure functions with unit specs
   first:
   - `placeTile` (shrink-to-fit, then push down);
   - `resizeTile`;
   - `pushDown`;
   - `compactLayout`;
   - `firstFreeSpot`;
   - `fromLegacyLayout`;
   - `toStoredLayout`.
3. **web-artists UI.** Replace the dnd-kit sortable `LayoutGrid`, `SortableTile` and
   `TileWidthControl` with a free-grid canvas: pointer drag with capture, ghost, corner resize,
   keyboard, and a drawer reusing the existing `CustomizeControls` entry point. Keep the
   `useCustomizableLayout` and `useWorkspaceLayout` public seams where possible. Remove dead
   code and the dnd-kit dependency only if nothing else uses it. Strings go in uk/pl/en.
4. **Docs.** Update the living-workspace spec's "Customizable layouts" bullet to point here,
   and set this spec to implemented with evidence.
5. **Split.** One PR for api + contracts, then one for web-artists: the
   `pr-scope/multi-workspace` label does not exist. Each stays under 3,000 lines.
