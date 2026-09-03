---
sidebar_position: 1
---

# Admin

Internal admin panel built on [Kottster](https://kottster.app/), an auto-generating
CRUD/dashboard framework that reads the database schema directly (via Knex) and produces
data-management pages with minimal hand-written code.

## 🚀 Quick Start

```bash
cd apps/admin

# Install dependencies (from repo root)
pnpm install

# Start development server
pnpm dev
```

Application will be available at `http://localhost:5480` locally (Kottster's own Vite dev
server port, set in `apps/admin/vite.config.ts`). In the Docker Compose stack it listens on
port 3002 internally, proxied by nginx in production — see
[docker-compose.prod.yaml](../../getting-started/architecture.md#-deployment-architecture).

## 🏗️ Architecture

Kottster owns most of the structure here — this isn't a hand-rolled FSD app:

```
apps/admin/
  app/
    _server/        Server bootstrap (app.ts, server.ts)
    pages/          One generated folder per data-source page (page.json config)
    schemas/         sidebar.json — admin navigation config
    main.tsx        Client entry
  kottster-app.json  Kottster project metadata
  vite.config.ts     Dev server + build config (@kottster/react plugin)
```

New data-management pages are added via `pnpm dev:add-data-source`, not by hand-authoring
FSD slices. Data access goes through Knex (`knex`, `pg`) directly against the shared
Postgres database — not through `@bitrate/contracts`/the NestJS API.

## 🎨 Tech Stack

- **Kottster** (`@kottster/react`, `@kottster/server`, `@kottster/cli`) — the admin
  framework itself
- **Vite** + **React 19** + **React Router** — Kottster's underlying dev/build tooling
- **Knex** + **pg** — direct Postgres access for generated data pages

## 🚀 Build & Deploy

```bash
pnpm --filter @bitrate/admin build
pnpm --filter @bitrate/admin start
```

---

**Related:**
- [Setup Guide](/docs/getting-started/setup)
- [Architecture Decision Records](/docs/architecture)
