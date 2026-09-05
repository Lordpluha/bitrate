# Bitrate

**All-in-one for musicians.** Turborepo + pnpm monorepo with web, mobile, desktop, and
backend apps. See [`brand.md`](apps/docs/docs/brand/brand.md) for what the product is and
[`design.md`](apps/docs/docs/brand/design.md) for how it should look and behave.

## 📚 Documentation

- **[Full docs site](apps/docs/)** — Docusaurus 3 site with guides, architecture, API reference
- **[Architecture](apps/docs/docs/getting-started/architecture.md)** — system design, data flow, DB schema
- **[Setup Guide](apps/docs/docs/getting-started/setup.md)** — detailed local setup instructions
- **[Roadmap](apps/docs/docs/guides/roadmap.md)** — milestones, current progress, future plans
- **[Contributing](CONTRIBUTING.md)** — git workflow, commit conventions, PR process
- **[Code style](CODE_STYLE.md)** — stable entry point for enforced conventions
- **[Architecture decisions](apps/docs/docs/architecture/)** — why the repository uses its core patterns
- **[Design system](apps/docs/docs/brand/)** — tokens and WCAG baseline
- **[Agent layer](.claude/README.md)** — repository-owned AI workflows
- **[CI/CD](.github/workflows/README.md)** — GitHub Actions workflow map

### Useful links

- **GitHub Project** — https://github.com/users/Lordpluha/projects/6
- **Chromatic** — https://www.chromatic.com/library?appId=68787858d0b6a0a00b0ca47f
- **Storybook** — https://bitrate-ui-git-develop-vladyslavs-projects-cc52700b.vercel.app/
- **Web App** — https://spotify-clone-web-olive.vercel.app/

---

## 🚀 Quick Start

### Requirements

| Tool | Version |
|---|---|
| Node.js | >= 24.x |
| pnpm | 10.30.3 |
| Docker | >= 24.x |
| Git | >= 2.x |
| [task](https://taskfile.dev/installation/) | >= 3.x |

`task` is the single entry point for every Docker and database workflow — run `task` with no
arguments to list them. Everything below can also be run by hand; `task` just keeps the
commands in one place.

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start infra, migrate, seed, then run all apps natively
task init:native
```

<details>
<summary>The same thing without <code>task</code></summary>

```bash
docker compose -f infra/docker-compose.dev.yaml up -d
pnpm --filter @bitrate/api run db:migration:start
pnpm --filter @bitrate/api run db:seed
pnpm dev
```

</details>

> For full Docker stack, mobile, desktop, or Windows setup see the **[Setup Guide](apps/docs/docs/getting-started/setup.md)**.

---

## 🌐 Service URLs

| Service | URL |
|---|---|
| Web Player | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/swagger |
| Web Artists | http://localhost:3002 |
| Storybook | http://localhost:6006 |
| Docs | http://localhost:3003 |
| Mobile (Metro) | http://localhost:8081 |
| Desktop (Vite) | http://localhost:1420 |

---

## 📦 Tech Stack

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
versioning. 40 GitHub Actions workflows build five Docker images per release and push them to GHCR;
production pulls those images rather than building, behind a required-reviewer gate. Docker Compose
runs the stack, `Taskfile.yml` is the only interface to it. nginx terminates TLS for all six hosts.

## 🧪 Verification

```bash
pnpm lint
pnpm check-types
pnpm build
pnpm knip
```

Package test surfaces:

```bash
# API — Jest
pnpm --filter @bitrate/api test
pnpm --filter @bitrate/api test:int
pnpm --filter @bitrate/api test:e2e

# Shared UI — Vitest + Playwright-backed browser screenshots
pnpm --filter @bitrate/ui-react test
pnpm --filter @bitrate/ui-react test:screenshot

# Web player — Vitest + standalone Playwright
pnpm --filter @bitrate/web-player test
pnpm --filter @bitrate/web-player test:e2e
pnpm --filter @bitrate/web-player test:screenshot

```

See the [testing guide](apps/docs/docs/guides/testing.md) for placement and runner details.

---

## 🏗️ Architecture contracts

- Web-player imports follow `app → views → widgets → features → entities → shared`.
- Next.js route files are framework adapters; full screens live in `views/`.
- API contracts flow from NestJS Swagger into `@bitrate/contracts`.
- Server state uses TanStack Query; new client state targets per-slice Zustand stores.
- Shared React primitives and design tokens both live in `@bitrate/ui-react`.
- User-facing web UI targets WCAG 2.2 AA.

See [`apps/docs/docs/architecture`](apps/docs/docs/architecture/) for the decisions and [`CLAUDE.md`](CLAUDE.md)
for the working rules.

---

## 🤖 Agent workflow

The repository includes a ticket-driven command set: `/br-create-task`, `/br-implement`,
`/br-auto`, `/br-sync-docs`. They all read the same conventions from `CLAUDE.md` and
`.claude/`, and every command has access to any project or global skill.

```text
/br-create-task → /br-implement → PR (confirmed)          # human in the loop
/br-auto                                                   # unattended, board Todo column
```

`/br-implement` reads `CLAUDE.md`'s exhaustive Rule Index first, then dispatches to a named
specialist agent by default — one of five app-scoped developers
(`br-frontend-developer`, `br-backend-developer`, `br-mobile-developer`,
`br-desktop-developer`), plus `br-planner`, `br-debugger`,
`br-tester`, `br-reviewer`, and `br-devops` for CI/infra. Pass `--session` to do the work
in-session instead. `/br-sync-docs` dispatches to `br-librarian` the same way, and
`/br-auto` runs `br-worker` in an isolated git worktree per issue. This
default-to-agent behavior also applies to ordinary tasks outside any command — see
`CLAUDE.md`.

Ticket/board state is queried live from GitHub (via `gh`/MCP), never mirrored to a file;
`/br-sync-docs` catches drift across `.claude/`, `.changeset/`, `apps/docs/`, `PRODUCT.md`,
and the root onboarding docs.

For work that is too large or too vague for a single command, install the
`mattpocock-skills` plugin (`claude plugin install mattpocock-skills`) and use `/grill-me`
to sharpen the idea before planning, and `/wayfinder` to drive a multi-session effort as a
map of decision tickets.

---

## 📄 License

MIT © 2026 Lordpluha
