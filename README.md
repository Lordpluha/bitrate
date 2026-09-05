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

### Backend
NestJS 11 · PostgreSQL 16 (Prisma) · Redis · BullMQ · Socket.io · JWT + OAuth · Swagger · Prometheus + Grafana

### Web (Next.js App Router + Feature-Sliced Design)
Next.js · React 19 · TailwindCSS v4 · Zustand target architecture · TanStack Query · openapi-fetch

### Mobile
React Native · Expo SDK 54 · expo-router · EAS Build

### Desktop
Tauri 2 · React · Vite

### Shared packages
`@bitrate/ui-react` · `@bitrate/contracts` · `@bitrate/svgr` · `@bitrate/vite-svgr` · `@bitrate/converter`

### Infrastructure
Turborepo · pnpm workspaces · Biome · Lefthook · Changesets · GitHub Actions (20+ workflows) · Docker Compose

---

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

The repository includes a ticket-driven command set: `/sp-create-task`, `/sp-implement`,
`/sp-auto`, `/sp-sync-docs`. They all read the same conventions from `CLAUDE.md` and
`.claude/`, and every command has access to any project or global skill.

```text
/sp-create-task → /sp-implement → PR (confirmed)          # human in the loop
/sp-auto                                                   # unattended, board Todo column
```

`/sp-implement` reads `CLAUDE.md`'s exhaustive Rule Index first, then dispatches to a named
specialist agent by default — one of five app-scoped developers
(`sp-frontend-developer`, `sp-backend-developer`, `sp-mobile-developer`,
`sp-desktop-developer`), plus `sp-planner`, `sp-debugger`,
`sp-tester`, `sp-reviewer`, and `sp-devops` for CI/infra. Pass `--session` to do the work
in-session instead. `/sp-sync-docs` dispatches to `sp-librarian` the same way, and
`/sp-auto` runs `sp-worker` in an isolated git worktree per issue. This
default-to-agent behavior also applies to ordinary tasks outside any command — see
`CLAUDE.md`.

Ticket/board state is queried live from GitHub (via `gh`/MCP), never mirrored to a file;
`/sp-sync-docs` catches drift across `.claude/`, `.changeset/`, `apps/docs/`, `PRODUCT.md`,
and the root onboarding docs.

For work that is too large or too vague for a single command, install the
`mattpocock-skills` plugin (`claude plugin install mattpocock-skills`) and use `/grill-me`
to sharpen the idea before planning, and `/wayfinder` to drive a multi-session effort as a
map of decision tickets.

---

## 📄 License

MIT © 2026 Lordpluha
