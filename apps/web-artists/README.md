# @bitrate/web-artists

Next.js 16 web application for the Bitrate artists portal.

## Stack

- **Next.js 16** App Router, React 19, TypeScript
- **TailwindCSS v4**, `@bitrate/ui-react` — shared component library
- **`@bitrate/contracts`** — OpenAPI TypeScript types (generated from Swagger)
- **Biome** — lint + format
- **Port:** 3002

Follows **Feature-Sliced Design**:

```
src/
  app/        — Next.js App Router pages and layouts
  views/      — full-page view compositions
  widgets/    — self-contained page sections
  features/   — user interactions
  entities/   — domain objects
  shared/     — cross-cutting utilities, API client, hooks
```

## Getting Started

```bash
# From repo root — installs all workspace deps
pnpm install

# Dev server (http://localhost:3002)
pnpm --filter @bitrate/web-artists dev

# Type check
pnpm --filter @bitrate/web-artists check-types

# Build
pnpm --filter @bitrate/web-artists build
```

Or inside `apps/web-artists/`:

```bash
pnpm dev     # starts ui-react build first via predev hook
pnpm build
pnpm check-types
```

## Notes

- The `predev` hook automatically builds `@bitrate/ui-react` before starting the dev server.
- Requires the API running on port 3000 for data fetching.
