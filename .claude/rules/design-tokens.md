---
paths:
  - "packages/ui-react/src/styles/**/*.css"
  - "apps/web-player/src/**/*.css"
  - "apps/web-artists/src/**/*.css"
  - "apps/admin/src/**/*.css"
---

# Web design tokens

- Hand-written CSS in packages/ui-react/src/styles is the token source. There is no
  separate tokens package or generation step. Consumers import @bitrate/ui-react/themes.css.
- A semantic role has one owner and both default dark and light values. Dim intentionally
  inherits unspecified roles; do not duplicate the dark theme to fill it out.
- Import new part-files through themes.css. Component roles alias semantic roles.
- Preserve the documented theme roles and public CSS export; do not bypass them with
  literal colors or framework-specific runtime dependencies.
- Angular consumes CSS, not React components. Svelte player has its own CSS property contract.
- Token map/examples: `.claude/references/styling-guide.md` → Design tokens.
