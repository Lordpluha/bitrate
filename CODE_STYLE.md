# Code style

The canonical conventions for this monorepo live in [`CLAUDE.md`](./CLAUDE.md) and the
deeper references under [`.claude/rules/`](./.claude/rules/).

This file is the stable human-facing entry point.

## Mechanical gates

- `pnpm lint` — Biome lint across the workspace.
- `pnpm format` — Biome formatting.
- `pnpm check-types` — TypeScript checks through Turborepo.
- `pnpm knip` — unused files, exports, and dependencies.
- Package-specific test commands — see [`apps/docs/docs/guides/testing.md`](./apps/docs/docs/guides/testing.md).

Do not weaken TypeScript, lint, test, or architecture settings to make a change pass.

## Core conventions

- TypeScript throughout; use `unknown` at trust boundaries and narrow it.
- Named types in signature positions; no anonymous object shapes.
- `async/await` instead of Promise chains.
- React uses named imports and named component exports.
- Web-player imports obey FSD boundaries and use the `@/` alias.
- API controllers stay thin; services own business logic; Swagger lives in `decorators/`.
- UI values come from the hand-written `@theme` layers in `packages/ui-react/src/styles/`;
  components do not invent colours,
  spacing, radii, or shadows.
- Comments are short factual TSDoc. Tracker metadata belongs in issues and commits.

When this file and a deeper project rule disagree, `CLAUDE.md` and `.claude/rules/` win.
