---
paths:
  - "apps/web-player/src/**/*.tsx"
  - "apps/web-artists/src/**/*.tsx"
  - "packages/ui-react/src/**/*.tsx"
---

# React web styling

- Reuse ui-react primitives before adding new ones. Merge conditional classes with `cn()`;
  use the established CVA pattern for real variants.
- Use semantic design tokens. Do not hardcode colors, use stock Tailwind color scales or
  `dark:` variants that bypass the project's theme system.
- Preserve responsive states, focus visibility, contrast, reduced motion and usable targets.
- Follow existing labels/icon/popup conventions; do not invent one-off component styles.
- CSS token ownership is in `design-tokens.md`; this rule does not apply to Angular,
  React Native or Svelte markup. Recipes: `.claude/references/styling-guide.md` as needed.
