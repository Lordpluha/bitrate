---
'@spotify/ui-react': minor
'@spotify/web-player': minor
'@spotify/web-artists': patch
---

Every component now paints with design tokens instead of Tailwind's built-in colour scales.
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
