# Design tokens

`packages/tokens/tokens.json` is the canonical source for palette, themes, typography,
spacing, radii, borders, shadows, breakpoints, opacity, containers, aspect ratios, and
z-index values.

## Pipeline

```text
packages/tokens/tokens.json
  → @spotify/tokens-generator
  → packages/ui-react/src/styles/palette.css
  → packages/ui-react/src/styles/layout.css
  → packages/ui-react/src/styles/typography.css
  → packages/ui-react/src/styles/themes.css
```

Run:

```bash
pnpm --filter @spotify/ui-react gen:tokens
```

Generated CSS is not edited manually. Change `tokens.json`, regenerate, inspect the diff,
then run the `ui-react` type/test/build checks.

## Consumption contract

- Components use semantic Tailwind utilities or CSS variables emitted by the generator.
- Do not add hardcoded colour, spacing, radius, shadow, breakpoint, or z-index values when
  an existing token expresses the role.
- If a role is missing, add a named token rather than an arbitrary utility.
- Theme changes swap token values; component JSX does not fork into separate light/dark
  trees.
- Consumers import package CSS through supported `@spotify/ui-react` exports.

## Taxonomy

- **Palette and themes** — semantic foreground/background and product accent roles.
- **Typography** — family, size, weight, line-height, and tracking.
- **Spacing and container** — layout rhythm and content bounds.
- **Border/radius/shadow** — component shape and elevation.
- **Breakpoints** — mobile-first responsive thresholds.
- **Z-index** — named stacking roles; overlays should use component defaults.
- **Motion** — animation values should respect reduced-motion preferences.

The concrete values are code in `tokens.json`; this document explains ownership, not a
second copy of those values.
