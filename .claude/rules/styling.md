---
name: styling
description: "Tailwind v4 + design tokens for the web apps — the hand-written @theme layers that are the token source, where each semantic role lives, the cn() plus CVA recipe, and the forbidden patterns that lint clean but silently break theming (Tailwind's built-in colour scales and the dark: variant). Use whenever writing or reviewing markup that sets className, adding a design token, or when a utility class appears to do nothing."
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Styling conventions — web-player

Tailwind v4 + `@bitrate/ui-react` design tokens + CVA + `cn()`. Read before writing any styled markup, any new component, or anything that sets `className`. For the token pipeline, see `.claude/rules/monorepo.md` § "Asset generation pipelines".

## Stack at a glance

| Concern | Choice |
|---|---|
| Utility engine | Tailwind v4 via `@tailwindcss/postcss` — no `tailwind.config.js` |
| Token layer | Hand-written `@theme` layers in `@bitrate/ui-react`, imported through `themes.css` |
| Class merging | `cn(...inputs)` from `@bitrate/ui-react` — wraps `clsx` + `tailwind-merge` |
| Variant component pattern | CVA (`class-variance-authority`) via `cva(...)` factory |
| Animations | `motion` (Motion for React) |
| Theme switching | CSS class on `<html>` (`light` / `dim`; dark is the default) resolved by `:root.<theme>` selectors |

## Design tokens

All design values are declared as Tailwind v4 `@theme` layers in `packages/ui-react/src/styles/`. That CSS is the source — there is no generator, no `tokens.json`, and nothing to re-run. Import it in the app root:

```css
/* apps/web-player/src/app/global.css */
@import "@bitrate/ui-react/themes.css";
```

**One import, not many.** `themes.css` is a barrel: it `@import`s `palette.css`,
`typography.css`, `layout.css`, `animations.css`, and every semantic-role part-file under
`themes/`, and declares no colour of its own. It is also the *only* stylesheet the package
exports: `@bitrate/ui-react/styles/palette.css` is not in the package's `exports` map and
fails with `MODULE_NOT_FOUND`.

### Where a role lives

Semantic roles are split across part-files under `packages/ui-react/src/styles/themes/`,
one group per file, each carrying **both** the default dark declarations and its
`:root.light` overrides:

| Part-file | Owns |
|---|---|
| `themes/base.css` | The shadcn role set (`background`, `card`, `primary`, `border`, …) — names mirror upstream and are never renamed |
| `themes/global/surfaces.css` | Fills and washes not tied to one component |
| `themes/global/text.css` | Text, icon, and divider neutrals |
| `themes/global/status.css` | `success` / `error` / `warning` / `info` and their foregrounds |
| `themes/global/decorative.css` | Chart series and decorative washes |
| `themes/components/<name>.css` | One file per component — `avatar.css`, `badge.css`, `table.css`… A file covers several components only when they are one family: `button.css` (Button + ButtonGroup), `input.css` (the text controls), `overlay.css` (the floating surfaces), `collection.css` (Item + Table) |

These files are **hand-written source**, not build output. Editing one is the whole
workflow — save the file and Tailwind picks the change up.

| Edit | Where |
|---|---|
| A raw colour value or a new scale | `src/styles/palette.css` |
| A semantic role's value in each theme | the part-file that owns it under `src/styles/themes/` |
| A new role | add it to **both** the `@theme` block and the `:root.light` block of one part-file |
| The brand primary or a surface value | `themes/base.css` — Bitrate Purple `#7c3aed` is `--color-purple-500`, aliased by `--color-primary` |
| A new part-file | create it, then add one `@import` line to `src/styles/themes.css` |

Three invariants have no tool enforcing them any more, so they are on you:

- **A role lives in exactly one part-file.** Declaring it twice means the later `@import`
  silently wins.
- **A role appears in both blocks.** A role present in `@theme` but missing from
  `:root.light` keeps its dark value in the light theme — it does not fall back to anything
  sensible.
- **Dim is deliberately partial.** `:root.dim` in `themes/base.css` overrides only the surface,
  text, border and action roles the brand board specifies. Every other role — component-scoped
  roles included — inherits its dark value on purpose, so a component gets dim support for free.
  Do not "complete" dim by copying the dark block into every part-file.
- **A new part-file is imported.** `themes.css` is a barrel of `@import`s and declares no
  colour of its own; an unimported part-file is dead.

A component-scoped role should alias the semantic role it is built on
(`--color-button-primary: var(--color-primary)`) rather than repeat a literal, so retuning
the semantic role carries through.

These `@theme` blocks are what Tailwind reads. Every `--color-*`, `--radius-*`, `--shadow-*` token in `@theme` produces a Tailwind utility: `bg-primary`, `text-foreground`, `border-input`, etc.

## The `cn()` + CVA recipe

```tsx
import { cn } from '@bitrate/ui-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type HTMLAttributes } from 'react'

const cardVariants = cva(
  'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      tone: {
        default: '',
        highlight: 'border-primary',
      },
    },
    defaultVariants: { tone: 'default' },
  }
)

export type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ tone }), className)} {...props} />
  )
)
```

Five non-negotiable rules for every variant component:

1. **`cva` for the class config** — even when there are no variants today.
2. **`cn(variants({ ... }), className)`** — base first, consumer `className` last; `tailwind-merge` dedupes.
3. **Named `<Component>Props`** extending the native HTML interface ∪ `VariantProps<typeof variants>`. No inline `{ ... }` props.
4. **`forwardRef`** when the component wraps a single DOM element.
5. **Token utilities only** — `bg-primary`, `text-foreground`, `border-input`. Never `bg-[#0a0a0a]`.

## Forbidden patterns

- **Inline hex / RGB / HSL literals** — no `#fff`, `rgb(...)`, `hsl(...)` in any `.tsx` or `.css` outside the token layer.
- **`style={{ }}` for colour or spacing** — `style` is acceptable only for runtime-computed layout values (e.g. dynamic width from JS). Anything paintable via a Tailwind utility goes in `className`.
- **`className` overrides not composed via `cn()`** — raw template literals bypass `tailwind-merge` and produce conflicting utilities.
- **Arbitrary colour values** — `bg-[#1a1a1a]` and `text-[color:#fff]` defeat the token system. Promote to a token instead.
- **`tailwind.config.js`** — Tailwind v4 reads config from `@theme`. A JS config file is a red flag.
- **`tailwindcss-animate`** — that package is Tailwind v3 only. Use the `motion` library or CSS transitions.
- **Tailwind's built-in colour scales** — `bg-slate-100`, `text-gray-500`, `border-zinc-700`
  and the rest. `scripts/check-design-tokens.mjs` owns the exact list (`STOCK_SCALES`); read it
  there rather than trusting a copy in prose, because the two drift whenever a scale moves
  between the repo palette and Tailwind's. See below — this one is invisible rather than
  merely untidy.
- **The `dark:` variant** — this repo never registers `@custom-variant dark`, so `dark:`
  compiles to `@media (prefers-color-scheme: dark)` and follows the **operating system**,
  not the `light`/`dark` class the app puts on `<html>`. A role already carries both
  themes, so a token-based class needs no variant at all.

### Why stock Tailwind colours are worse than a hex literal

A hex literal is at least visible to review and to the `Quality-1` grep. `bg-slate-100` is
not: it lints clean, type-checks clean, and looks like a design token. But the repo never
clears Tailwind's defaults (no `--color-*: initial`), so it resolves to Tailwind's own grey —
a value no `@theme` layer in `src/styles/` declares and `:root.light` never overrides. The component silently stops responding to the theme switch.

That is not hypothetical: 22 of 29 `ui-react` components were painted this way, every
mechanical gate stayed green, and the theme toggle did nothing to them while the OS setting
did. `pnpm check:tokens` (`scripts/check-design-tokens.mjs`, wired into the
`UI React Design Tokens` CI job) now fails the build on any occurrence in
`apps/web-player/src`, `apps/web-artists/src`, or `packages/ui-react/src`. Specs and stories
are exempt — they assert class merging, not appearance.

Reach for a semantic role first (`bg-muted`, `text-muted-foreground`, `border-border`,
`ring-ring`, `bg-primary`, `bg-destructive`, `bg-popover`, `chart-1`…`chart-5`), and a repo
palette scale (`purple`, `green`, `neutral`, `blue`, `red`, `amber`, `grey`, `black`,
`white`, `white-alpha`) only when the colour is deliberately the same in both themes.

## Responsive conventions

Tailwind v4 reads breakpoints from `--breakpoint-*` tokens. Rules:

- **Mobile-first.** Unprefixed utilities apply at every viewport; `sm:` / `md:` / `lg:` / `xl:` / `2xl:` apply at that width and up.
- **Use prefixes only** — no hand-written `@media` blocks in component files.
- **Don't invent breakpoints** outside the registered set.
- Filter/action bars stack on mobile. Controls use `w-full` at the base and become intrinsic
  only at the appropriate breakpoint.
- Validate changed screens at 320 CSS px and 400% zoom.

## Themes

There are three themes: **dark** (the default, declared in `@theme`), **light** (`:root.light`)
and **dim** (`:root.dim`, a low-light variant layered on dark). The active one is a CSS class on
`<html>` driven by `apps/web-player/src/shared/constants/themes.ts` — add a theme there and the
switcher, the no-flash boot script, and the provider all pick it up. Components reference token
utilities; never branch the JSX per theme.

```tsx
/** ✗ Don't — two JSX trees for dark mode. */
{theme === 'dark' ? <LogoDark /> : <LogoLight />}

/** ✓ Do — single component, token utilities with dark: prefix if needed. */
<Logo className="text-foreground" />
```

## Adding a new component to `@/shared/ui/`

1. Check `@bitrate/ui-react` first — use its exported components rather than building from scratch.
2. If building a custom component: `src/shared/ui/<PascalName>.tsx` + update `src/shared/ui/index.ts`.
3. Follow the CVA + `cn()` + `forwardRef` pattern above.
4. Keep the file ≤ 100 logic lines (`code-principles.md`).
5. Token utilities only — no hex.

## Interaction and component details

- Interactive controls show the appropriate cursor unless disabled.
- Icon-only controls have a token-backed square target and an accessible name.
- Button icons follow the package component API; callers do not add repetitive ad-hoc
  margins.
- Select/dropdown popups align to the trigger or documented content width.
- Overlay components own their stacking layer; no emergency `z-[9999]`.

### Button labels and icons

- Primary actions use concrete verbs (`Save playlist`, `Create account`), not vague labels
  such as `Submit` or `OK`.
- Destructive labels name the consequence (`Delete playlist`).
- A decorative icon does not replace the text unless the control has an accessible name.
- Icon placement follows reading order and the component's established API.

### Popup width

- Select/dropdown content is at least trigger width when options would otherwise clip.
- Long translated labels wrap or truncate intentionally.
- Do not encode one caller's width into a shared primitive; expose a variant or compose at
  the caller.

## CSS and bundle discipline

- Prefer utilities and component variants over one-off global selectors.
- Global CSS is reserved for generated tokens, resets, and application-wide behaviour.
- New animation/style dependencies require a bundle-impact check.
- Run the affected package/app build after token generation or global CSS changes.

## Do / don't

```tsx
/** ✓ Do */
import { cn } from '@bitrate/ui-react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
```

```tsx
/** ✗ Don't */
export function BadgeBad({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-full px-2.5 ${className}`}
      style={{ background: '#1db954', color: '#fff' }}
    />
  )
}
```
