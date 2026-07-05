# Music Platform (Spotify Clone)

Full-stack Spotify clone — Turborepo + pnpm monorepo with web, mobile, desktop, and backend apps.

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
- **Storybook** — https://spotify-clone-ui-git-develop-vladyslavs-projects-cc52700b.vercel.app/
- **Web App** — https://spotify-clone-web-olive.vercel.app/

---

## 🚀 Quick Start

### Requirements

| Tool | Version |
|---|---|
| Node.js | >= 20.x |
| pnpm | 10.30.3 |
| Docker | >= 24.x |
| Git | >= 2.x |

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start postgres + redis (~320 MB)
docker compose -f infra/docker-compose.dev.yaml up -d

# Run migrations + seed
pnpm --filter @spotify/api run db:migration:start
pnpm --filter @spotify/api run db:seed

# Start all apps
pnpm dev
```

> For full Docker stack, mobile, desktop, or Windows setup see the **[Setup Guide](apps/docs/docs/getting-started/setup.md)**.

---

## 🌐 Service URLs

| Service | URL |
|---|---|
| Web Player | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/swagger |
| Web Artists | http://localhost:3002 |
| Admin | http://localhost:3002 |
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
`@spotify/ui-react` · `@spotify/tokens` · `@spotify/contracts` · `@spotify/svgr` · `@spotify/converter`

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
pnpm --filter @spotify/api test
pnpm --filter @spotify/api test:int
pnpm --filter @spotify/api test:e2e

# Shared UI — Vitest + Playwright-backed browser screenshots
pnpm --filter @spotify/ui-react test
pnpm --filter @spotify/ui-react test:screenshot

# Web player — Vitest + standalone Playwright
pnpm --filter @spotify/web-player test
pnpm --filter @spotify/web-player test:e2e
pnpm --filter @spotify/web-player test:screenshot

# Token generator — node:test
pnpm --filter @spotify/tokens-generator test
```

See the [testing guide](apps/docs/docs/guides/testing.md) for placement and runner details.

---

## 🏗️ Architecture contracts

- Web-player imports follow `app → views → widgets → features → entities → shared`.
- Next.js route files are framework adapters; full screens live in `views/`.
- API contracts flow from NestJS Swagger into `@spotify/contracts`.
- Server state uses TanStack Query; new client state targets per-slice Zustand stores.
- Shared React primitives and design tokens live in `@spotify/ui-react` and
  `@spotify/tokens`.
- User-facing web UI targets WCAG 2.2 AA.

See [`apps/docs/docs/architecture`](apps/docs/docs/architecture/) for the decisions and [`AGENTS.md`](AGENTS.md)
for the working rules.

---

## 🤖 Agent workflow

The repository includes project-specific `/sp-*` commands for planning, implementation,
debugging, reviewing, scaffolding, and test authoring. They all read the same conventions
from `AGENTS.md` and `.claude/`.

```text
/sp-planner → /sp-developer → test author → /sp-review
```

Use `/sp-test` for API Jest, `/sp-vitest` for `ui-react` DOM tests, and `/sp-playwright`
for `ui-react` browser screenshots.

---

## 📄 License

MIT © 2026 Lordpluha
