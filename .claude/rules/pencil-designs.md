---
paths:
  - "pencil/**"
---

# Pencil designs — one palette, three themes

- Every design uses ONE palette and THREE themes: Dark, Light, Dim (neutral). The palette is
  the code's colour tokens (`packages/tailwind/src`), mirrored into
  `pencil/web-player-design/design-system/bitrate.lib.pen` by `pnpm design:tokens`.
- A design imports that library as `ds` and paints only with `$ds:--<role>` variables. No
  hardcoded hex (fully transparent `#rrggbb00` gradient stops excepted), no file-local colour
  variables, no extra palettes, alpha-variant families or per-edition colour sets.
- The library follows shadcn: it exposes the shadcn semantic roles (`background`, `card`,
  `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`,
  `sidebar-*`, `chart-*`, each with its `-foreground`) plus Bitrate's status, `shadow`, `scrim`
  and the palette. Component roles from `themes/components/*` stay in code.
- Primitives come from the page "00 • Components (shadcn)" in the library (a fork of Pencil's
  shadcn kit rebound to Bitrate tokens). Build product components from those; do not import
  `pencil:shadcn.lib.pen` directly — its colours are its own palette and cannot be rebound.
- Themes are expressed with the library's `Mode` axis, not by hand-recolouring a copy. In a file
  that imports the library the axis is aliased: `theme: { "ds:Mode": "Light" }` — a bare `Mode`
  is silently ignored and everything renders Dark. Theme showcase frames are fine; they bind to
  the same tokens.
- A colour the palette lacks is a code change first: add the role in `packages/tailwind/src`
  (see design-tokens rule), run `pnpm design:tokens`, then use it in the design.
- `pnpm check:pen-tokens` enforces this for every `.pen` under `pencil/`;
  `node scripts/bind-pen-colors.mjs <file.pen>` migrates a design that breaks it.
- `.pen` files are edited through the Pencil MCP while open in the editor. After changing a
  `.pen` on disk, reload the editor window before further MCP edits, or it saves its stale copy.
- Every design draws all reachable screen states, not just the populated default: default,
  loading, empty, error and not-found/unavailable, plus the screen's own restricted, offline,
  validation/submission, overlay and selection states — for desktop and mobile. A state that
  cannot occur is omitted on purpose and the reason is noted in the frame's `context`.
  Full list: `apps/docs/docs/brand/design.md` § 21 "Screen states".
- Designs invent nothing. Every visible element is an instance of a library component (`ds:`);
  a page adds only layout-only frames (no fill, stroke, effect or corner radius of their own)
  and content overrides (text, cover images). Never draw a chip, row, card, skeleton, panel or
  text style locally — if the library lacks it, add it to the library as a component first.
