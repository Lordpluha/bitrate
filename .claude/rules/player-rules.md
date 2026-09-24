---
paths:
  - "packages/player/**"
---

# Svelte player boundaries

- Svelte 5 custom element, not a React/FSD application. Preserve the public host contract.
- Contract runtime imports must remain Svelte/DOM/element/engine-free and SSR-safe.
  Keep both import linting and AST boundary tests; dynamic imports count too.
- Engine uses injected transport; no host app globals, auth stores or framework coupling.
- Preserve guarded custom-element registration, explicit defineBitratePlayer and server imports.
- Engine export is migration-only; avoid new consumers outside the agreed migration.
- Style with the player CSS custom-property contract, not Tailwind or ui-react runtime.
- ESLint + Prettier; svelte-check for types. Use browser tests for the element, real Node
  for SSR safety and appropriate unit tests for the framework-free engine/contract.
- Before editing exports, transport, SSR or build pipelines read the corresponding section
  of `.claude/references/player-rules-guide.md`. Preserve existing output/package contracts.
