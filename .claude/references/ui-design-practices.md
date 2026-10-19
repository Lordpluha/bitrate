# UI design practices

Optional reference, not loaded automatically. Read it when designing or restyling a Bitrate
screen, tile or component, or when `design-taste-frontend` is active for a Bitrate task.

Source: the `Leonxlnx/taste-skill` pack (`gpt-taste`, `high-end-visual-design`,
`minimalist-ui`, `industrial-brutalist-ui`, `redesign-existing-projects`), filtered on
2026-10-19 down to what fits Bitrate's tokens, themes and design system. Only
`design-taste-frontend` stays installed; the other five skills were removed. How the pack's
documents are written is covered separately in [skill-writing-lessons](skill-writing-lessons.md).

## Read first: what wins

1. Project rules: `rules/design-tokens.md`, `rules/styling.md`, `ui-react-rules`, and the
   [styling guide](styling-guide.md).
2. This file.
3. `design-taste-frontend`. Use its design read, dials and AI-tell lists; where it disagrees
   with the table below, the Bitrate column applies.

| `design-taste-frontend` says | Bitrate does |
|---|---|
| §3.C: prefer Phosphor, Lucide discouraged | Keep `lucide-react` and the `ui-react` SVGR icons; one family, no swap. |
| §4.1: pick Geist, Satoshi, Cabinet Grotesk | Use the typography tokens from `@bitrate/tailwind`; add no fonts. |
| §4.2: avoid purple accents | Bitrate Purple (`--color-primary`) is the brand accent; use it without glows or neon gradients. |
| §8.A: pair every colour with `dark:` | Token utilities only; themes switch via `:root.light` / `:root.dim`. |
| §2, appendices: install a real design system | `@bitrate/ui-react` is the design system; missing pieces are added there first. |
| §12: write a block library | Not used; `.claude/templates/` and `ui-react` own reusable structure. |
| Any hex value, font name or icon set in an example | Map it to the nearest semantic token or DS component, never paste it. |

## Bitrate constraints

- **One palette, three themes:** dark (default), light, dim. Check every changed screen in all
  three; contrast is at least WCAG AA in each.
- **Bento tiles:** screens are built from grid tiles so the layout can later be customised.
- **All states:** each screen covers default, loading, empty, error and not-found, plus its own
  states (offline, permission denied, playing/paused and so on).
- **DS only:** every element is a `ui-react` component or token; a missing piece goes into the
  library before the screen uses it.
- **Naming:** listening together is **Jam**, device handoff is **Bitrate Connect**; never
  "rooms" or "sessions" in UI copy.

## Layout and bento grids

| Failure mode | Fix |
|---|---|
| Empty cells or a missing corner in a tile grid | `grid-flow-dense`; check that `col-span`/`row-span` interlock at every breakpoint. |
| Eight similar tiles | Three to five tiles with distinct jobs; two or three differ visibly (artwork, tinted token surface, data). |
| Asymmetric grid breaks on phones | Below `md`, one column, spans reset, no overlap or rotation (overlaps steal touch targets). |
| `h-screen` jumps on iOS Safari | `min-h-dvh`. |
| Percentage flex maths (`w-[calc(33%-1rem)]`) | CSS Grid. |
| Content stretched edge to edge on wide screens | A max-width container from the layout tokens. |
| Buttons and titles at different heights in sibling tiles | Pin actions to the tile bottom; align shared elements across siblings. |
| Mathematically centred but looks off (play glyph in a circle, icon beside text) | Nudge 1-2px optically. |
| Nested rounded containers look mismatched | Inner radius = outer radius minus the padding between them. |

## Typography

- A heading wraps to at most three lines: widen its container before shrinking the type.
- Body text stays within about 65 characters per line.
- Build hierarchy with weights 500 and 600 as well as 400/700.
- Durations, counters and play counts use `tabular-nums` so they do not jitter.
- Large headings take negative tracking; small uppercase labels take positive tracking.
- `text-wrap: balance` on headings and `pretty` on paragraphs removes orphans.
- Sentence case for headings. Section labels name the content ("Recently played"), never a
  number ("SECTION 01").

## Colour and surfaces

- One accent (primary); status colours carry meaning only.
- A section never switches theme mid-screen; a contrasting band is a darker token surface of
  the same theme.
- Cards exist when elevation signals hierarchy; otherwise spacing or a surface token
  separates content.
- Shadows and borders come from tokens. One light direction across a screen.
- Texture (grain, noise) sits on one fixed `pointer-events-none` layer, never on a scrolling
  container.

## Motion

Motion uses `motion` (`motion/react`) and the tokens in `packages/tailwind/src/animations.css`.

- Animate only `transform` and `opacity`; `will-change` only while animating.
- Scroll reveals use `whileInView` or `IntersectionObserver`, not `scroll` listeners.
- Continuous input (pointer, scroll progress, scrubbing) goes through `useMotionValue` /
  `useTransform`, not `useState`.
- Lists enter staggered (about 80 ms per item), short distance (about 12px), ease-out curve
  such as `cubic-bezier(0.16, 1, 0.3, 1)`.
- Hover and press: 200-300 ms; press feedback `scale(0.98)`.
- `backdrop-blur` only on fixed or sticky surfaces (player bar, navigation, overlays).
- `prefers-reduced-motion` turns movement into a fade or nothing.

## States and interaction

- Every control has hover, active, `focus-visible` and disabled states.
- Loading is a skeleton shaped like the final layout, not a page spinner.
- Empty states offer the next action ("Create your first playlist").
- Errors are inline and direct ("Connection failed. Try again."); no `window.alert()`.
- Navigation marks the current item; every flow has a way back; no `#` links.
- Simple edits happen inline or in a sheet, not a modal.
- Layers come from the z-index scale, not `z-[9999]`.

## Copy and mock data

- Plain, specific verbs. No "Elevate", "Seamless", "Unleash", "Next-gen", "Game-changer".
- No "Oops!" and no exclamation marks in success messages; active voice.
- Mock data looks real: uneven numbers (47.2%, 3:47), distinct names, artwork and dates; no
  Lorem ipsum, "John Doe" or "Acme".

## Redesigning an existing screen

1. **Scan** the screen's components, tokens and states.
2. **Diagnose** against the sections above; list each generic pattern and missing state.
3. **Fix** in this order: literal values to tokens; hover/active/focus states; layout and
   spacing; generic markup to DS components; loading/empty/error states; typography polish.

Keep the stack, add no dependency without a bundle check, and keep each change small enough
to review.

## Done when

- [ ] Every colour, font, radius, shadow and duration resolves to a token.
- [ ] Every element is a `ui-react` component or composed from them.
- [ ] Checked in dark, light and dim at 320 px and desktop width.
- [ ] Default, loading, empty, error and not-found states exist.
- [ ] No empty grid cell at any breakpoint; tiles collapse to one column on phones.
- [ ] Animations use `transform`/`opacity` and respect reduced motion.
- [ ] Copy uses Jam / Bitrate Connect naming and passes the copy list above.

## Left out on purpose

Python-style randomisation, AIDA landing structure, GSAP ScrollTrigger recipes, font and icon
library swaps, fixed hex palettes, `picsum.photos` imagery, glass and "double-bezel" cards as
a default, CRT/brutalist effects and floating pill navigation. Each conflicts with the token
system, the DS-only rule or the player's information density.
