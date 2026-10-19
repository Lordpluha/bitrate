---
sidebar_position: 1
---

# Web Player

Next.js web application for music streaming. Replaces the retired `apps/web` client — see
[ADR-0011](../../architecture/0011-retire-apps-web.md).

## 🚀 Quick Start

```bash
cd apps/web-player

# Install dependencies (from repo root)
pnpm install

# Start development server
pnpm dev
```

Application will be available at `http://localhost:3001`

## 🏗️ Architecture

`apps/web-player/src` follows **Feature-Sliced Design (FSD)**; see
[ADR-0002](../../architecture/0002-web-player-feature-sliced-design.md). Imports flow
downward only: `app → views → widgets → features → entities → shared`.

```
apps/web-player/src/
├── app/               # Next.js App Router — layout.tsx, page.tsx, providers
├── views/             # Full-page compositions for one route
├── widgets/           # Self-contained sections: Header, Player, Sidebar
├── features/          # User interactions: Album, AuthModal, Playlist, Track
├── entities/          # Domain objects: Track, User, Player
└── shared/            # api/, hooks/, store/, ui/, routes/, constants/, validation/
```

Route files under `app/` are thin adapters that render a view — see
[ADR-0010](../../architecture/0010-next-routes-as-adapters.md).

## 🎬 Landing (`/`)

`app/(home)/` serves the landing with its own fonts (Unbounded, Inter, JetBrains Mono); auth and
legal pages keep `app/(landing)/` with the shared Header and Footer. `views/LandingView` renders
eleven scenes on the server. Its motion engine (`lib/engine/`: GSAP scenes, a Three.js stage,
physics, intro, cursor) is imported only on the client after mount. Without WebGL it switches to
2D fallbacks, and with reduced motion it is a static, scrollable page. The landing copy is a
local catalog (en, uk, pl; other locales read English). Styling is Tailwind: `lib/styles/landing.styles.ts` lists
utilities per marker class in cascade order (context rules as arbitrary variants), and `lc()`
merges an element's entries with `cn`; `ui/landing.css` keeps only keyframes, the `html` scroll
and cursor locks and the grain data URI. Behaviour and acceptance:
[web-player landing spec](../../specs/web-player-landing.md); motion reference:
`pencil/web-player-design/landing/motion-prototype.html`.

## 🎨 Tech Stack

- **Next.js (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **@bitrate/ui-react** — design tokens, CVA, shadcn-style components
  (see [ADR-0006](../../architecture/0006-ui-react-tokens-shadcn.md))
- **openapi-fetch** + **TanStack Query** — typed API client generated from the NestJS
  Swagger contract (see [ADR-0004](../../architecture/0004-openapi-data-layer.md))
- **Zustand** — cross-component client state (see
  [ADR-0005](../../architecture/0005-client-state-zustand.md))
- **React Hook Form** + **Zod** — forms (see
  [ADR-0007](../../architecture/0007-forms-react-hook-form-zod.md))
- **CMAF + MediaSource Extensions** — first-party adaptive playback over byte ranges
  (see [ADR-0020](../../architecture/0020-cmaf-range-mse-playback.md))
- **hls.js** — fallback playback for tracks with no CMAF renditions

## 🔧 API client

```ts
// shared/api/client/fetchClient.ts — openapi-fetch + JWT refresh middleware
export const apiClient = createClient<ApiPaths>({ baseUrl: ... })

// shared/api/client/reactQueryClient.ts — openapi-react-query
export const { useQuery, useMutation, useSuspenseQuery } = createReactQueryClient(apiClient)
```

Components call `useQuery`/`useMutation` from `reactQueryClient` — never raw `fetch` or Axios.

## 🧪 Testing

```bash
pnpm --filter @bitrate/web-player test:unit
pnpm --filter @bitrate/web-player test:int
pnpm --filter @bitrate/web-player test:e2e
pnpm --filter @bitrate/web-player test:screenshot
```

## 🚀 Build & Deploy

```bash
pnpm --filter @bitrate/web-player build
pnpm --filter @bitrate/web-player start
```

---

**Related:**
- [Setup Guide](/docs/getting-started/setup)
- [API Documentation](/docs/applications/api/overview)
- [UI Components](/docs/packages/ui-react)
- [Architecture Decision Records](/docs/architecture)
