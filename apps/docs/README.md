# @bitrate/docs

Docusaurus 3 documentation site for the Bitrate monorepo.

## Stack

- **Docusaurus 3.10** — static site generator
- **Mermaid** — diagrams in Markdown (`@docusaurus/theme-mermaid`)
- **MDX** — interactive docs with React components
- **Port:** 3003

## Getting Started

```bash
# From repo root
pnpm install

# Start dev server (http://localhost:3003)
pnpm --filter @bitrate/docs start

# Build static output
pnpm --filter @bitrate/docs build

# Serve built output locally
pnpm --filter @bitrate/docs serve
```

Or inside `apps/docs/`:

```bash
pnpm start
pnpm build
pnpm serve
```

## Structure

```
docs/                 — documentation pages (Markdown / MDX)
  guides/             — developer guides (roadmap, setup, etc.)
  applications/       — per-app documentation
    api/
    web-player/
    mobile/
    desktop/
blog/                 — blog posts
src/
  css/                — custom CSS
  pages/              — custom React pages
static/               — static assets (images, files)
docusaurus.config.ts  — site configuration
sidebars.ts           — sidebar structure
```

## Adding Documentation

Create a `.md` or `.mdx` file in `docs/`. Docusaurus picks it up automatically based on the sidebar config in `sidebars.ts`.

For Mermaid diagrams, use fenced code blocks:

```markdown
```mermaid
graph TD
  A --> B
```
```

## Deployment

```bash
# Using SSH
USE_SSH=true pnpm run deploy

# Using GitHub token
GIT_USER=<username> pnpm run deploy
```

Deployment pushes to the `gh-pages` branch.
