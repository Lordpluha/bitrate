# Design tokens

The Tailwind v4 `@theme` layers under `packages/ui-react/src/styles/` are the canonical
source for palette, themes, typography, spacing, radii, borders, shadows, breakpoints,
opacity, containers, aspect ratios, and z-index values. They are written by hand — there is
no generator and no intermediate `tokens.json`.

## Layout

```text
packages/ui-react/src/styles/
  palette.css        raw colour scales — no semantic meaning
  typography.css     families, sizes, weights, line-heights, tracking
  layout.css         spacing, radii, borders, shadows, breakpoints, z-index
  animations.css     motion values
  themes.css         barrel — @import only, declares no colour of its own
  themes/
    base.css                 the shadcn role set every other part builds on
    global/*.css             roles not tied to one component
    components/<name>.css    one file per component, or per component family
```

Each semantic role lives in exactly one part-file, and that file carries **both** the
default dark declarations (`@theme`) and the `:root.light` overrides — so a role's whole
dark+light story is readable in one place.

| Part-file | Owns |
|---|---|
| `themes/base.css` | The shadcn role set every other part builds on — never renamed |
| `themes/global/*.css` | Roles not tied to any one component (surfaces, text/border neutrals, status, decorative) |
| `themes/components/<name>.css` | One file per component; a shared file only where components are one family — `button.css`, `input.css`, `overlay.css`, `collection.css` |

A component-scoped role aliases the semantic role it is built on
(`--color-button-primary: var(--color-primary)`) rather than repeating a literal, so
retuning the semantic role carries through to every component built on it.

Nothing is generated, so nothing is regenerated: edit the file, save, done. Three invariants
have no tool enforcing them — a role must be declared in exactly one part-file, must appear
in **both** the `@theme` and `:root.light` blocks, and a new part-file must be added to the
`themes.css` barrel or it is dead.

## Consumption contract

- Components use semantic Tailwind utilities or the CSS variables the `@theme` layers declare.
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

The concrete values are the CSS itself; this document explains ownership, not a second
copy of those values.
