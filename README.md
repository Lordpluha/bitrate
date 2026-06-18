# Music Platform (Spotify Clone)

Full-stack Spotify clone — Turborepo + pnpm monorepo with web, mobile, desktop, and backend apps.

## 📚 Documentation

- **[Full docs site](apps/docs/)** — Docusaurus 3 site with guides, architecture, API reference
- **[Architecture](apps/docs/docs/getting-started/architecture.md)** — system design, data flow, DB schema
- **[Setup Guide](apps/docs/docs/getting-started/setup.md)** — detailed local setup instructions
- **[Contributing](CONTRIBUTING.md)** — git workflow, commit conventions, PR process
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

### Web (Next.js 15 + Feature-Sliced Design)
Next.js 15 · React 19 · TailwindCSS v4 · Zustand · TanStack Query · openapi-fetch

### Mobile
React Native · Expo SDK 54 · expo-router · EAS Build

### Desktop
Tauri 2 · React · Vite

### Shared packages
`@spotify/ui-react` · `@spotify/tokens` · `@spotify/contracts` · `@spotify/svgr` · `@spotify/converter`

### Infrastructure
Turborepo · pnpm workspaces · Biome · Lefthook · Changesets · GitHub Actions (20+ workflows) · Docker Compose

---

## 📄 License

MIT © 2026 Lordpluha
