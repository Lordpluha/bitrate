# Bitrate

**All-in-one for musicians.** A Turborepo + pnpm monorepo holding the listener app, the artists
portal, the API and the shared design system, plus mobile and desktop shells that are scaffolded
but not yet built out.

Everything beyond this page lives at **[docs.bitrate.me](https://docs.bitrate.me)** — start with
[Introduction](https://docs.bitrate.me/docs/getting-started/introduction) for the map, or
[Architecture](https://docs.bitrate.me/docs/getting-started/architecture) for how the pieces fit.

## Live sites

Five sites on one VPS behind one nginx, all served from images CI builds — see
[Deployment](apps/docs/docs/infrastructure/deployment.md).

| Site | URL |
|---|---|
| Web player | https://bitrate.me |
| Artists portal | https://artists.bitrate.me |
| API | https://api.bitrate.me · [Swagger](https://api.bitrate.me/swagger) |
| Documentation | https://docs.bitrate.me |
| Component workshop | https://ui.bitrate.me |

## Quick Start

Install the [requirements](#requirements) first, then:

```bash
pnpm install
cp .env.example .env
task init:native
```

`task init:native` starts the infrastructure containers, runs the migrations, seeds the database
and then runs every app natively. `task` with no arguments lists every Docker, database and
monitoring workflow it owns — see the [Taskfile documentation](https://taskfile.dev/usage/).

`.env` is what Docker Compose reads; each app also carries its own `.env.example` for running that
app alone. For the full Docker stack, mobile, desktop or Windows, follow the
[setup guide](https://docs.bitrate.me/docs/getting-started/setup) instead — it covers the paths
this three-line version deliberately skips.

## Requirements

| Tool | Version | Needed for |
|---|---|---|
| [Node.js](https://nodejs.org/en/download) | >= 24 | everything |
| [pnpm](https://pnpm.io/installation) | 10.30.3 exactly | everything |
| [Git](https://git-scm.com/downloads) | >= 2 | everything |
| [Docker](https://docs.docker.com/engine/install/) | >= 24 | Postgres, Redis, the container stacks |
| [task](https://taskfile.dev/installation/) | >= 3 | every Docker and database workflow |
| [Rust](https://www.rust-lang.org/tools/install) | >= 1.77 | `apps/desktop` only |
| [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) | >= 0.4 | `packages/performance-test` only |

The pnpm version is pinned by `packageManager` and the Node floor by `engines`, so both are checked
rather than suggested. Don't run `npm install` or `yarn` here — the lockfile is pnpm's.

## Tech Stack

Versions are the ones actually resolved in the workspace, not aspirations. Where a choice has a
reason that is easy to get wrong, the reason is in the linked rule rather than repeated here.

### Backend — `apps/api`

NestJS 11 on Node 24, TypeScript 6. PostgreSQL 16 through Prisma 7, whose datasource lives in
`prisma.config.ts` rather than in the schema. Redis 7 via ioredis, backing both BullMQ 5 job queues
and the throttler's storage. Socket.io 4 for real-time — single-instance only until a Redis adapter
is added. Validation is Zod 4 through nestjs-zod, so DTOs and their runtime checks cannot drift.
Auth is JWT with argon2 hashing plus Google and Facebook OAuth. Swagger is generated from
decorators kept in `decorators/`, never inline. Mail goes out through nodemailer, audio is probed
with music-metadata, helmet sets the security headers.

Errors and traces go to Sentry (`@sentry/nestjs` 10 with the profiling integration), sampled at 10%
in production. Metrics are hand-rolled in `infra/observability` and emitted in Prometheus text
format behind a token — there is no Prometheus server and no Grafana in this stack today.

Tests are Jest 30 in three layers: unit with `jest-mock-extended`, integration through supertest,
and E2E against real Postgres and Redis.

### Web — `apps/web-player`, `apps/web-artists`

Next.js 16 App Router with React 19, organised by Feature-Sliced Design — imports flow
`app → views → widgets → features → entities → shared` and never upward. Server state is TanStack
Query 5 over `openapi-fetch`, typed from the generated `@bitrate/contracts`; client state is
Zustand 5 with a shared persistence factory. Forms are React Hook Form with Zod resolvers. Styling
is Tailwind v4 configured entirely in CSS `@theme` layers — there is no `tailwind.config.js`.
Animation is Motion. Tests are Vitest 4 and Playwright 1.60.

### Shared UI — `packages/ui-react`

The design system and component library: Base UI primitives, Tailwind v4, CVA variants merged
through `cn()`, Lucide icons, built with Vite 8. Storybook 10 is published at `ui.bitrate.me`. Four
co-located Vitest projects per component — unit, integration, DOM snapshot, and Chromium screenshot
through `@vitest/browser-playwright`.

### Mobile — `apps/mobile`

React Native 0.81 on Expo SDK 54 with expo-router 6 and Reanimated 4. Scaffolded, not started; the
web conventions above deliberately do not apply there.

### Desktop — `apps/desktop`

Tauri 2 shell around a React 19 renderer built by Vite 8. Also scaffolded rather than built out.

### Documentation — `apps/docs`

Docusaurus 3.10 with the Mermaid theme, published at `docs.bitrate.me`. Architecture decisions live
here as ADRs.

### Shared packages

`@bitrate/contracts` — OpenAPI types generated from the running API.
`@bitrate/ui-react` — components and design tokens.
`@bitrate/svgr` and `@bitrate/vite-svgr` — SVG sources compiled to React components at build time.
`@bitrate/converter`, `@bitrate/ncs-parser` — media utilities.
`@bitrate/performance-test` — k6 load, spike and soak scenarios.

### Tooling and delivery

Turborepo over pnpm 10 workspaces. Biome for lint and format, Lefthook for git hooks, Changesets for
versioning. GitHub Actions builds five Docker images per release and pushes them to GHCR; production
pulls those images rather than building, behind a required-reviewer gate. Docker Compose runs the
stack, `Taskfile.yml` is the only interface to it. nginx terminates TLS for all six hostnames.

## Verification

```bash
pnpm check:env
```

Checks that this machine can actually build the repository: every tool in
[Requirements](#requirements) against its minimum, and every declared dependency of every
workspace. It exits non-zero when something required is missing, and warns without failing when
only optional tooling is absent.

Narrow it to the projects you are working on:

```bash
pnpm check:env api ui-react   # only these two
pnpm check:env --list         # the workspace names it accepts
```

The repository's own gates — lint, types, build, tests — are documented in
[CONTRIBUTING.md](CONTRIBUTING.md), and the test layers in the
[testing guide](https://docs.bitrate.me/docs/guides/testing).

## License

MIT © 2025 Lordpluha — see [LICENSE](LICENSE).
