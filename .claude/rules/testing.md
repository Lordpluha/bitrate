---
paths:
  - "**/*.unit-spec.*"
  - "**/*.int-spec.*"
  - "**/*.snapshot-spec.*"
  - "**/*.screenshot-spec.*"
  - "**/*.e2e-spec.*"
  - "**/*.spec.ts"
  - "apps/*/tests/**"
  - "apps/api/test/**"
---

# Testing behavior

- Logic/API/bug fixes use mattpocock-skills:tdd. Reuse confirmed public seams and behavior;
  one failing behavior test → minimal implementation → green. Cosmetics/docs are exempt.
- Match the workspace: API uses Jest; web-player/ui-react use Vitest and Playwright;
  Admin uses its Angular Vitest builder; player separates engine/contract and browser tests.
  Read only the needed runner skill; do not force a new stack onto scaffolds.
- Cover meaningful positive/negative cases through public interfaces. No tests mirroring
  internals or invented tests solely for coverage percentage. Preserve existing assertions.
- New web-player Playwright specs must be in its .sniffler/test-map.json where required.
- Use br-verify for bounded execution and evidence. Detailed layer selection/recipes:
  `.claude/references/testing-guide.md`. Determine suite counts from current files.
