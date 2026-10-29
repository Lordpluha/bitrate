---
sidebar_position: 1
---

# Admin Panel

The operator panel for Bitrate staff: moderation, catalog and account management. An Angular
zoneless SPA on spartan-ng — see [ADR-0035](../../architecture/0035-admin-panel-on-angular.md).
It replaced the Kottster panel removed in
[ADR-0025](../../architecture/0025-remove-admin-panel.md).

## 🚀 Quick Start

```bash
# Install dependencies (from repo root)
pnpm install

# Start development server (port from ADMIN_PORT, 3005 in the example env)
pnpm --filter @bitrate/admin dev
```

Angular has no `.env` support of its own, so `scripts/with-env.mjs` loads the env files and
generates the module the app reads `NG_APP_API_URL` from.

## 🗺️ Screens

Every route is lazy-loaded and guarded twice: `requireStaffSession` restores the staff session
(an httpOnly cookie) or redirects to `/login?next=`, and `requirePermission('<resource>:<action>')`
checks one permission from `domain/access/permission.ts`.

| Area | Routes |
|---|---|
| Overview | `overview`, `overview/reports` — dashboard with drill-down analytics |
| Moderation | `moderation`, `moderation/:id` — user reports |
| Catalog | `catalog`, `catalog/:id` — tracks, with an audio player built on `@bitrate/player` |
| Releases | `releases`, `releases/:id` — review of artist submissions |
| Content | `albums`, `playlists` with `:id` detail — take-down and restore |
| Accounts | `artists`, `users` (listeners) with `:id` detail |
| Genres | `genres`, `genres/new`, `genres/:id` — CRUD with guarded delete |
| Staff | `staff`, `roles` with `new` and `:id` — roles are editable sets of permissions |
| Audit | `audit` — the staff action log |

Lists share batch actions, CSV export, sorting, filters and pagination kept in the URL.

## 🏗️ Architecture

`src/app/` has four layers: `domain/` (types and rules), `application/` (use cases and signal
stores), `infrastructure/` (HTTP repositories over `HttpClient`, zod DTOs typed by
`@bitrate/contracts`, mappers) and `presentation/` (pages, components and the vendored spartan-ng
`ui/` primitives). It runs without zone.js.

Themes are dark, light and dim from `@bitrate/tailwind`. Localization uses Transloco with `en`
and `uk` dictionaries; only navigation and login are translated so far.

## 🧪 Testing

```bash
pnpm --filter @bitrate/admin test:unit   # Vitest with jsdom
pnpm --filter @bitrate/admin lint        # ESLint — admin is not a Biome workspace
pnpm --filter @bitrate/admin check:i18n  # dictionary keys match across locales
```

There are no end-to-end tests yet.

---

**Related:**
- [API Overview](/docs/applications/api/overview)
- [Architecture Decision Records](/docs/architecture)
