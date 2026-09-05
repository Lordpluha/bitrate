---
sidebar_position: 1
---

# Web Artists

Next.js web application for the artist-facing side of the platform (landing page, artist
auth). Early-stage — currently a marketing landing view plus login/registration route
stubs; see the app's own `package.json` and source tree for the current feature set before
relying on specifics here.

## 🚀 Quick Start

```bash
cd apps/web-artists

# Install dependencies (from repo root)
pnpm install

# Start development server
pnpm dev
```

Application will be available at `http://localhost:3002`.

## 🏗️ Architecture

`apps/web-artists/src` follows the same Feature-Sliced Design layering as `web-player` —
see [ADR-0002](../../architecture/0002-web-player-feature-sliced-design.md) and
`.claude/rules/fsd-web-player.md` for the full layer rules. Currently populated layers:
`app/` (routes), `views/` (the landing page composition), `widgets/` (the site header),
and `shared/ui/` (logo and language-switcher components).

## 🎨 Tech Stack

- **Next.js (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **@bitrate/ui-react** — shared design tokens and components
- **@bitrate/contracts** — generated OpenAPI types (dev dependency, for the upcoming API
  integration)

## 🧪 Testing

No test suite exists yet for this app — none of `check-types`/`lint`/`format` are
test-specific, they're the shared mechanical gates. Follow the `vitest`/`playwright`
skills (same conventions as `web-player`) once specs are added.

## 🚀 Build & Deploy

```bash
pnpm --filter @bitrate/web-artists build
pnpm --filter @bitrate/web-artists start
```

---

**Related:**
- [Setup Guide](/docs/getting-started/setup)
- [Web Player](/docs/applications/web-player/overview) — the sibling app sharing the same
  FSD conventions
- [UI Components](/docs/packages/ui-react)
- [Architecture Decision Records](/docs/architecture)
