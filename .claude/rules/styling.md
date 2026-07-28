# Styling conventions — web-player

Tailwind v4 + `@spotify/ui-react` design tokens + CVA + `cn()`. Read before writing any styled markup, any new component, or anything that sets `className`. For the token pipeline, see `.claude/rules/monorepo.md` § "Asset generation pipelines".

## Stack at a glance

| Concern | Choice |
|---|---|
| Utility engine | Tailwind v4 via `@tailwindcss/postcss` — no `tailwind.config.js` |
| Token layer | CSS variables from `@spotify/ui-react/styles/*.css` (generated from `tokens.json`) |
| Class merging | `cn(...inputs)` from `@spotify/ui-react` — wraps `clsx` + `tailwind-merge` |
| Variant component pattern | CVA (`class-variance-authority`) via `cva(...)` factory |
| Animations | `motion` (Motion for React) |
| Theme switching | CSS class on `<html>` resolved by `:root.<theme>` selectors from tokens |

## Design tokens

All design values come from `packages/tokens/tokens.json` → `@spotify/ui-react` CSS files. Import the CSS in the app root:

```ts
import '@spotify/ui-react/styles/palette.css'
import '@spotify/ui-react/styles/layout.css'
import '@spotify/ui-react/styles/typography.css'
import '@spotify/ui-react/styles/themes.css'
```

The generated CSS registers Tailwind v4 `@theme` blocks. Every `--color-*`, `--radius-*`, `--shadow-*` token in `@theme` produces a Tailwind utility: `bg-primary`, `text-foreground`, `border-input`, etc.

## The `cn()` + CVA recipe

```tsx
import { cn } from '@spotify/ui-react'
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

## Responsive conventions

Tailwind v4 reads breakpoints from `--breakpoint-*` tokens. Rules:

- **Mobile-first.** Unprefixed utilities apply at every viewport; `sm:` / `md:` / `lg:` / `xl:` / `2xl:` apply at that width and up.
- **Use prefixes only** — no hand-written `@media` blocks in component files.
- **Don't invent breakpoints** outside the registered set.
- Filter/action bars stack on mobile. Controls use `w-full` at the base and become intrinsic
  only at the appropriate breakpoint.
- Validate changed screens at 320 CSS px and 400% zoom.

## Dark mode

Theme is a CSS class on `<html>` (driven by the theme token system). Components reference token utilities — no separate JSX trees for light / dark.

```tsx
/** ✗ Don't — two JSX trees for dark mode. */
{theme === 'dark' ? <LogoDark /> : <LogoLight />}

/** ✓ Do — single component, token utilities with dark: prefix if needed. */
<Logo className="text-foreground" />
```

## Adding a new component to `@/shared/ui/`

1. Check `@spotify/ui-react` first — use its exported components rather than building from scratch.
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
import { cn } from '@spotify/ui-react'
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
