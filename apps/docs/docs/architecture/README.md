# Architecture decision records

This directory records stable architectural decisions for the Bitrate monorepo.
ADRs explain why the repository uses a pattern; `CLAUDE.md` and `.claude/rules/` explain
how to apply it day to day.

| ADR | Decision |
|---|---|
| [0001](./0001-monorepo-build-runtime.md) | Turborepo + pnpm multi-runtime monorepo |
| [0002](./0002-web-player-feature-sliced-design.md) | Feature-Sliced Design for web-player |
| [0003](./0003-nextjs-app-router.md) | Next.js App Router |
| [0004](./0004-openapi-data-layer.md) | OpenAPI-first client and TanStack Query |
| [0005](./0005-client-state-zustand.md) | Zustand target for client state |
| [0006](./0006-ui-react-tokens-shadcn.md) | Shared UI package, tokens, Base UI, shadcn methodology |
| [0007](./0007-forms-react-hook-form-zod.md) | React Hook Form + Zod |
| [0008](./0008-agent-layer.md) | Repository-owned AI agent layer |
| [0009](./0009-shadcn-compositions.md) | shadcn produces package-owned compositions |
| [0010](./0010-next-routes-as-adapters.md) | App Router files stay thin; views own screens |
| [0011](./0011-retire-apps-web.md) | Retire apps/web in favor of apps/web-player |
| [0012](./0012-ticket-driven-agent-commands.md) | Ticket-driven agent commands, GitHub Projects, and Obsidian sync |
| [0013](./0013-docs-sync.md) | apps/docs vs .claude — ownership boundary and drift detection |
| [0014](./0014-obsidian-storage-scope.md) | What in obsidian/ is committed vs local-only |
| [0015](./0015-graphify-obsidian-decoupled.md) | graphify and the obsidian/ vault are decoupled |
| [0016](./0016-live-github-queries.md) | Retire the obsidian/ ticket/board mirror for live GitHub queries |
| [0017](./0017-remove-obsidian-vault.md) | Remove the obsidian/ working-notes vault |
| [0018](./0018-consolidate-agents-into-claude.md) | Consolidate `.agents/`/`AGENTS.md` into `.claude/` only |
| [0019](./0019-remove-obsidian-export-convenience.md) | Remove the `graphify:obsidian` convenience wrapper |
| [0020](./0020-cmaf-range-mse-playback.md) | Single-file CMAF + Range index + MSE for audio playback |
| [0021](./0021-default-agent-dispatch.md) | Default to agent dispatch across all commands and ordinary tasks |
| [0022](./0022-app-scoped-agent-roster.md) | App-scoped developer agents, unattended `/br-auto` pipeline, retire `br-ticket` |
| [0023](./0023-tokens-into-ui-react.md) | Hand-write the design tokens as CSS; retire the token generator |
| [0024](./0024-rebrand-to-bitrate.md) | Rebrand the project from spotify-clone to Bitrate |
| [0025](./0025-remove-admin-panel.md) | Remove the Kottster admin panel |
| [0026](./0026-pnpm-11-settings-in-workspace-yaml.md) | pnpm 11; `pnpm-workspace.yaml` is the only home for pnpm settings |
| [0027](./0027-deploy-by-pulling-ci-images.md) | Deploy by pulling CI-built images; production configuration lives in GitHub |
| [0028](./0028-split-brand-foundation.md) | Split the brand foundation into one page per decision |
| [0029](./0029-release-pr-merged-by-a-human.md) | Release by a pull request a human merges; the tag is the derived product version |
| [0030](./0030-remove-performance-testing.md) | Remove the performance testing suite |
| [0031](./0031-expand-docs-sync-scope.md) | Expand `/br-sync-docs` to root onboarding docs and `.claude/` self-consistency |

Create new records from [`template.md`](./template.md). Accepted decisions are changed by
a superseding ADR rather than silently rewriting history.
