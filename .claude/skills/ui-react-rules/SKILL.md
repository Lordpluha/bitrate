---
name: ui-react-rules
description: Project conventions for the packages/ui-react component library — where component source, barrels, and config live, the search-before-adding workflow, Base UI as the primitive library, and where the generic shadcn skill's defaults are overridden. Use whenever adding, searching for, or modifying a UI component in packages/ui-react, or whenever the generic shadcn skill's guidance conflicts with this package's existing source.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# ui-react rules — `@bitrate/ui-react`

The generic shadcn skill is linked at `.claude/skills/shadcn/`. This file records the
bitrate overrides; when guidance conflicts, this file and the existing package source
win.

## Ownership and config

- Config: `packages/ui-react/components.json`
- Component source: `packages/ui-react/src/components/ui/<kebab-name>/`
- Component barrel: `packages/ui-react/src/components/ui/index.ts`
- Package barrel: `packages/ui-react/src/index.ts`
- Class helper: `cn` from `packages/ui-react/src/lib/utils.ts`
- Primitive library: Base UI (`@base-ui-components/react`)
- Consumer import: `import { Button } from '@bitrate/ui-react'`
- Raw source art: `packages/ui-react/assets/` — `icons/` (SVG the svgr plugin compiles into
  `src/icons/svgr/` on `pnpm build`) and `images/` (raster files stories import as
  `@assets/images/...`). Nothing under `assets/` is shipped; it is build-time input only.
- Design tokens: hand-written `@theme` layers in `packages/ui-react/src/styles/`. That CSS is
  the source — there is no `tokens.json` and no generator (ADR-0023).

Put a new SVG in `assets/icons/` and rebuild — never hand-write a file in `src/icons/svgr/`,
it is regenerated on every build.

`components.json` describes the package as it actually is (`src/styles/index.css`, no
Tailwind config file, `cssVariables: true`, `baseColor: neutral`). Inspect generated diffs
carefully; package source, Tailwind v4 setup, and design-token pipeline are authoritative.

## Before creating a component

1. Search existing exports and component folders.
2. Search the shadcn registry through the CLI and read current component docs. MCP is
   disabled by default in `.mcp.json` for token budget; use it only if enabled locally.
3. Prefer composition from existing `@bitrate/ui-react` components.
4. Add a new primitive only when no existing component or composition fits.

Run CLI commands from `packages/ui-react/`:

```bash
pnpm dlx shadcn@latest info
pnpm dlx shadcn@latest search @shadcn -q "<need>"
pnpm dlx shadcn@latest docs <component>
pnpm dlx shadcn@latest add <component> --dry-run
```

Never overwrite an existing component without explicit approval. Use `--diff` and merge
upstream changes while preserving local variants and tests.

## Package component shape

```text
components/ui/<name>/
  <name>.tsx
  <name>.stories.tsx
  <name>.unit-spec.tsx
  <name>.int-spec.tsx
  <name>.snapshot-spec.tsx
  <name>.screenshot-spec.tsx
  index.ts
```

Not every first draft needs every test file, but public primitives should converge on this
matrix. Export through the local barrel and `components/ui/index.ts`.

## Project-specific rules

- Component APIs are project-owned. Inspect the installed source before applying generic
  Base UI or Radix advice. For example, the current `Button` intentionally exposes
  `asChild` through the package's `Slot` helper.
- Use the token-backed utilities the `@theme` layers in `src/styles/` produce.
- Use `cn()` and CVA for variants.
- Use icons from `@/icons` or the package's configured icon source before adding another
  icon library.
- Forms compose the existing package primitives (`Form`, `InputGroup`, `InputContext`,
  `InputWithLabel`, etc.) and React Hook Form + Zod.
- Toasts use the existing `Sonner` export.
- New UI code needs Storybook coverage and tests proportional to behaviour.

Known overrides to the generic skill:

| Generic guidance | bitrate convention |
|---|---|
| Base UI triggers always use `render` | Follow the installed component API; `Button` currently supports `asChild` |
| Button has no loading prop | Existing `Button` has `isLoading`; preserve compatibility unless intentionally redesigning it |
| Generic flat component destination | Use `components/ui/<kebab-name>/<name>.tsx` plus local and package barrels |
| Generic icon library assumption | Prefer generated `@/icons` and existing package icons |
| Generic form primitives | Reuse the form/input primitives already exported by `@bitrate/ui-react` |

After adding or updating a component:

```bash
pnpm --filter @bitrate/ui-react check-types
pnpm --filter @bitrate/ui-react lint
pnpm --filter @bitrate/ui-react test:unit
pnpm --filter @bitrate/ui-react test:int
```

Run snapshot/screenshot updates only when the output change is intentional.

## Related rules and skills

- `shadcn` — the generic, project-agnostic shadcn reference this file overrides.
- `project-conventions` — the cross-cutting rules this file specializes.
