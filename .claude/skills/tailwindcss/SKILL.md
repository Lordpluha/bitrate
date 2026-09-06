---
name: tailwindcss
description: Tailwind v4 conventions for this monorepo — CSS-first @theme configuration with no tailwind.config.js, token-backed utilities from @bitrate/ui-react, cn() merging, CVA variants, and the v3 patterns that no longer work. Use when writing or reviewing any className, adding a design token, or when a utility class silently does nothing.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Tailwind v4 — CSS-first, token-backed

`.claude/rules/styling.md` is the rule; this skill covers the **v4 mechanics** behind it,
including the v3 habits that fail silently here.

## There is no `tailwind.config.js`

Tailwind v4 is configured in CSS. The tokens are hand-written in
`packages/ui-react/src/styles/*.css`, which register `@theme` blocks — that CSS is the source,
not build output (see [ADR-0023](../../../apps/docs/docs/architecture/0023-tokens-into-ui-react.md)). Every token in `@theme` becomes a utility automatically:

```css
@theme {
  --color-primary: oklch(...);   /* → bg-primary, text-primary, border-primary */
  --radius-lg: 0.5rem;           /* → rounded-lg */
  --breakpoint-md: 48rem;        /* → md: */
}
```

**A `tailwind.config.js` appearing in this repo is a red flag**, not a fix. To add a design
value, declare it in the `@theme` layer that owns it under `packages/ui-react/src/styles/`.
That CSS is the source: there is no generator and nothing to re-run.

The app imports the generated stylesheets at its root:

```css
/* apps/web-player/src/app/global.css */
@import "@bitrate/ui-react/themes.css";
```

**One import, not many.** `themes.css` is a barrel: it `@import`s `palette.css`,
`typography.css`, `layout.css`, `animations.css`, and every semantic-role part-file under
`themes/`, and declares no colour of its own. It is also the *only* stylesheet the package
exports: `@bitrate/ui-react/styles/palette.css` is not in the package's `exports` map and
fails with `MODULE_NOT_FOUND`.

Semantic roles live in one part-file each under `styles/themes/` (`base.css`,
`global/*.css`, `components/*.css`), every part carrying both the dark declarations and its
`:root.light` overrides. A role's value is written in the part-file itself; which part-file
owns a role is simply the file it is declared in — see
`.claude/rules/styling.md` § "Where a role lives".

## Token utilities only

```tsx
/** ✓ */ <div className="bg-primary text-primary-foreground border-border" />
/** ✗ */ <div className="bg-[#1db954]" style={{ color: '#fff' }} />
```

No hex, rgb, or hsl literals in `.tsx` or `.css` outside the token layer. No arbitrary colour
values — `bg-[#1a1a1a]` defeats theming, and the value will be wrong in the other theme.
`style={{}}` is acceptable only for a genuinely runtime-computed layout value (a width from
JS), never for colour or spacing.

## Merging — always through `cn()`

```tsx
import { cn } from '@bitrate/ui-react'

<div className={cn('rounded-lg p-4', isActive && 'ring-2 ring-primary', className)} />
```

`cn()` is `clsx` + `tailwind-merge`. A template literal —
``className={`p-4 ${className}`}`` — skips `tailwind-merge`, so a caller passing `p-8` gets
`p-4 p-8` and whichever CSS rule happens to win. Consumer `className` always goes **last**.

## Variants — CVA, always

```tsx
const badge = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badge>
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badge({ variant }), className)} {...props} />
}
```

Use `cva` even when there are no variants yet — it is the shape the next variant slots into.

## v3 habits that break in v4

| v3 | v4 |
|---|---|
| `tailwind.config.js` `theme.extend` | `@theme` in CSS, from generated tokens |
| `tailwindcss-animate` | **incompatible** — use `motion` or CSS transitions |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `bg-opacity-50` | `bg-primary/50` |
| Implicit `border-gray-200` default | borders default to `currentColor` — set `border-border` explicitly |
| `flex-shrink-0` / `flex-grow` | `shrink-0` / `grow` |
| JS-configured `content` paths | automatic source detection |

The renamed utilities are the ones that bite: a v3 class name that no longer exists produces
**no class and no error** — the element just renders unstyled. If a utility "does nothing",
check it still exists in v4 before debugging anything else.

## Responsive and theming

Mobile-first: unprefixed applies everywhere, `sm:`/`md:`/`lg:` apply at that width **and up**.
Use the registered breakpoints; do not invent one and do not hand-write `@media` in a
component file. Validate changed screens at 320px and 400% zoom.

Theme is a class on `<html>` resolved by `:root.<theme>` selectors from the token CSS.
Components reference token utilities and work in both themes — never branch the JSX:

```tsx
/** ✗ */ {theme === 'dark' ? <LogoDark /> : <LogoLight />}
/** ✓ */ <Logo className="text-foreground" />
```

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/tailwindcss` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('tailwindcss/package.json').version"
   ```
2. **Then the official docs:** https://tailwindcss.com/docs — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because v3 utility names silently produce no class in v4 — see the rename table above.

## Related

- `.claude/rules/styling.md` — the rule this implements, plus forbidden patterns.
- `ui-react-rules` skill — where components live in `packages/ui-react`.
- `base-ui` skill — the unstyled primitives these utilities style.
- `.claude/rules/monorepo.md` § "Asset generation pipelines" — token regeneration.
