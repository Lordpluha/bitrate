# ADR-0001: Turborepo + pnpm multi-runtime monorepo

Status: Accepted

Date: 2026-06-24

## Context

The product ships a NestJS API, Next.js web applications, Expo mobile app, Tauri desktop
app, Docusaurus documentation, and shared TypeScript packages. They need one dependency
graph and reproducible build order without forcing every surface into one runtime.

## Decision

- pnpm workspaces own dependency installation and `workspace:*` linking.
- Turborepo owns root orchestration and dependency-aware `build`, `lint`, `test`,
  `check-types`, and `dev` tasks.
- Each app/package owns its runner-specific scripts and configuration.
- Shared packages use the `@bitrate/` namespace.
- Node 20+ and the pinned `pnpm@10.30.3` package manager are the supported baseline.
- PostgreSQL and Redis run through the minimal development Compose stack; apps normally
  run natively.

## Consequences

Root commands are the common interface, while package filters remain the fastest local
feedback loop. Changes to shared packages can fan out to multiple applications and must be
verified proportionally.

## Alternatives considered

- **Independent repositories** — rejected because contracts, tokens, and UI evolve together.
- **One framework/runtime** — rejected because mobile, desktop, backend, and docs have
  genuinely different runtime requirements.
