---
sidebar_position: 1
---

# Web Artists

The artists portal at [artists.bitrate.me](https://artists.bitrate.me): a public page, the artist
auth screens, and the signed-in artist workspace. Built on TanStack Start (Vite + Nitro), not
Next.js — see [ADR-0034](../../architecture/0034-artists-portal-on-tanstack-start.md). Artists are
the product's primary audience ([ADR-0032](../../architecture/0032-artist-first.md)); the
workspace is a first version and several actions are still labelled "coming soon" in the UI.

## 🚀 Quick Start

```bash
# Install dependencies (from repo root)
pnpm install

# Start development server
pnpm --filter @bitrate/web-artists dev
```

Application will be available at `http://localhost:3002`.

## 🗺️ Routes

| Route | What it is |
|---|---|
| `/` | Public page: what the workspace does today, with sign-up and log-in |
| `/login`, `/registration`, `/verify-email`, `/forgot-password`, `/reset-password` | Artist auth |
| `/legal/$slug` | Terms, privacy, community, complaints, copyright, artist agreement |
| `/dashboard` | Signed-in overview; guarded in `beforeLoad`, redirects to `/login?next=` |
| `/dashboard/music`, `/dashboard/music/$releaseId` | Private catalogue and the release workspace ([ADR-0052](../../architecture/0052-artist-release-workspace-foundation.md), [ADR-0053](../../architecture/0053-private-artist-music-catalogue.md)) |
| `/dashboard/distribution` | Planned stores per release; delivery to stores is not connected |
| `/dashboard/analytics` | Plays and listeners on Bitrate over 7, 28 or 90 days |
| `/dashboard/profile`, `/dashboard/settings` | Public profile, account settings and signed-in devices |

## 🏗️ Architecture

`apps/web-artists/src` follows Feature-Sliced Design with TanStack file routes in place of
`app/`: `routes/` → `views/` → `widgets/` → `features/` → `entities/` → `shared/`. The API client
is `openapi-fetch` typed by `@bitrate/contracts`, with TanStack Query for server state; the
session lives in `shared/auth/` and the router context. There is no i18n runtime yet.

## 🎨 Tech Stack

- **TanStack Start** (React Router + Start, Vite, Nitro) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **@bitrate/ui-react** — shared design tokens and components
- **@bitrate/contracts** — generated OpenAPI types

## 🧪 Testing

```bash
pnpm --filter @bitrate/web-artists test:unit        # Vitest
pnpm --filter @bitrate/web-artists test:e2e         # Playwright against a stub API
pnpm --filter @bitrate/web-artists test:screenshot  # Playwright screenshot baselines
```

## 🚀 Build & Deploy

```bash
pnpm --filter @bitrate/web-artists build
pnpm --filter @bitrate/web-artists start
```

---

**Related:**
- [Setup Guide](/docs/getting-started/setup)
- [Web Player](/docs/applications/web-player/overview)
- [UI Components](/docs/packages/ui-react)
- [Architecture Decision Records](/docs/architecture)
