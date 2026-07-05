# Architecture decision records

This directory records stable architectural decisions for the Spotify clone monorepo.
ADRs explain why the repository uses a pattern; `AGENTS.md` and `.claude/rules/` explain
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

Create new records from [`template.md`](./template.md). Accepted decisions are changed by
a superseding ADR rather than silently rewriting history.
