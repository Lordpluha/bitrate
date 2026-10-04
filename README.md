# Bitrate

**All-in-one for musicians.** A [Turborepo](https://turborepo.com) + [pnpm](https://pnpm.io)
monorepo holding the listener app, the artists portal, the admin panel, the API and the shared
design system, plus mobile and desktop shells that are scaffolded but not yet built out.

Everything beyond this page lives at **[docs.bitrate.me](https://docs.bitrate.me)** — start with
[Introduction](https://docs.bitrate.me/docs/getting-started/introduction) for the map, or
[Architecture](https://docs.bitrate.me/docs/getting-started/architecture) for how the pieces fit.

| Section | What it covers |
|---|---|
| [How to start](#how-to-start) | Run the Docker stack |
| [How to develop](#how-to-develop) | Host tooling, native servers and checks |
| [How to AI](#how-to-ai) | [Claude Code](https://www.claude.com/product/claude-code) requirements and optional integrations |
| [Tech Stack](#tech-stack) | What each workspace is built with |

## Live sites

Five sites on one VPS behind one [nginx](https://nginx.org), all served from images CI builds —
see [Deployment](apps/docs/docs/infrastructure/deployment.md).

| Site | URL |
|---|---|
| Web player | <https://bitrate.me> |
| Artists portal | <https://artists.bitrate.me> |
| API | <https://api.bitrate.me> · [Swagger](https://api.bitrate.me/swagger) |
| Documentation | <https://docs.bitrate.me> |
| Component workshop | <https://ui.bitrate.me> |

## How to start

Use this path to run the web stack in [Docker](https://www.docker.com). For editing code and
running checks on the host, continue with [How to develop](#how-to-develop).

### Requirements — run the Docker stack

| Requirement | Version / condition | Purpose |
|---|---|---|
| [Git](https://git-scm.com) | 2.x | Clone the repository |
| [Docker Engine](https://docs.docker.com/engine/) or [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Engine 24+ with the daemon running | Build and run application/infrastructure containers |
| [Docker Compose](https://docs.docker.com/compose/) | v2, available as `docker compose` | Compose stacks in `infra/` |
| [Task (go-task)](https://taskfile.dev) | v3 | Repository Docker and database commands |

This path runs [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io) inside containers. Host
[Python](https://www.python.org), [Rust](https://www.rust-lang.org) and AI tools are not
required. Verify the host tools before starting:

```bash
git --version
docker --version
docker compose version
task --version
```

```bash
git clone https://github.com/Lordpluha/bitrate.git
cd bitrate
task init
```

`task init` builds the development images, starts services, runs database migrations and
seeds data. Subsequent starts use `task dev:up`; stop with `task dev:down`.
Run `task` to list the available workflows.

Default Docker addresses:

| Service | Address |
|---|---|
| API / [Swagger](https://swagger.io) | `http://localhost:3000/swagger` |
| Web player | `http://localhost:3001` |
| Artists portal | `http://localhost:3004` |
| Admin | `http://localhost:3005` |

Mobile, desktop, docs and monitoring use separate profiles/tasks.

The development Compose files supply local defaults; no repository-root `.env` is needed.
Export shell variables to override them, for example `POSTGRES_PORT=5433 task infra:up`.
Production deployment uses [GitHub environment](https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment)
secrets/variables and its separate deployment workflow. See
[the setup guide](apps/docs/docs/getting-started/setup.md) for other launch paths.

## How to develop

### Requirements — edit, build and test

| Requirement | Version / condition | Purpose |
|---|---|---|
| [Git](https://git-scm.com) | 2.x | Branches, commits and hooks |
| [Node.js](https://nodejs.org) | >=24; `.nvmrc` selects v24 | Run workspace tools and native application servers |
| [pnpm](https://pnpm.io) | **12.7.0**, pinned in `package.json` | Install the workspace and run scripts |
| [Docker Compose](https://docs.docker.com/compose/) + [Task](https://taskfile.dev) | As above, when using local API infrastructure | [PostgreSQL](https://www.postgresql.org)/[Redis](https://redis.io) and database tasks |
| [Bash](https://www.gnu.org/software/bash/) and standard shell utilities | For repository shell scripts and hooks; [WSL2](https://learn.microsoft.com/windows/wsl/) on Windows for these commands | Local automation |

[package.json](package.json) owns the Node floor and package-manager version. Use pnpm for
this workspace; the package lockfile is `pnpm-lock.yaml`.

```bash
# If using nvm:
nvm install
nvm use

npm install --global pnpm@12.7.0
node --version
pnpm --version

# Install application dependencies without optional AI-tool setup (Bash/WSL):
SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install
```

The two flags skip only the repository's optional [Graphify](https://pypi.org/project/graphifyy/)/[RTK](https://github.com/rtk-ai/rtk)
installers. Package build scripts and [Lefthook](https://github.com/evilmartians/lefthook) setup
still run. A plain `pnpm install` also attempts those AI-tool installers: Graphify uses an
available [`uv`](https://docs.astral.sh/uv/)/[`pip`](https://pip.pypa.io), and RTK's installer
can configure a **global Claude hook**. Use the same flags on later installs when you do not want
that setup. If you use [nvm](https://github.com/nvm-sh/nvm), `nvm install` reads `.nvmrc`.

For native servers, create each needed app's `.env` from its `.env.example` **if the target
does not exist**. Templates are in `apps/api`, `apps/web-player`, `apps/web-artists` and
`apps/admin`; keep existing local values. See the [environment guide](apps/docs/docs/guides/environment.md).
Stop the full Docker application stack before running native servers on the same ports.

```bash
task infra:up
task db:migrate:native
task db:seed:native

# Run these in separate terminals for API + web-player development:
pnpm --filter @bitrate/api start:dev
pnpm --filter @bitrate/web-player dev
```

After environment setup, `task init:native` combines infrastructure, migrations, seeding and
`pnpm dev`. Use the filtered commands above when you need only part of the workspace.

### Requirements for specific work

| Work | Additional requirements |
|---|---|
| Browser E2E / screenshot tests | [Playwright](https://playwright.dev) browser binaries and their OS libraries; for web-player: `pnpm --filter @bitrate/web-player exec playwright install chromium` |
| API E2E | Running test [PostgreSQL](https://www.postgresql.org)/[Redis](https://redis.io) and the test environment described in the [testing guide](apps/docs/docs/guides/testing.md) |
| Mobile | [Expo](https://expo.dev)-compatible device/emulator; [Android SDK](https://developer.android.com/studio) or macOS/[Xcode](https://developer.apple.com/xcode/) for the corresponding native target — [mobile setup](apps/mobile/README.md) |
| Desktop native app | [Rust](https://www.rust-lang.org)/[Cargo](https://doc.rust-lang.org/cargo/) and [platform WebView/build dependencies](https://v2.tauri.app/start/prerequisites/) — [desktop setup](apps/desktop/README.md); frontend-only [Vite](https://vite.dev) work needs no Rust |
| GitHub CLI workflows | Authenticated [`gh`](https://cli.github.com) with access to the relevant repository/project; not required for local builds |

Linters, test runners, [TypeScript](https://www.typescriptlang.org) and formatters come from
workspace dependencies; use the owning package's scripts. For example:

```bash
pnpm --filter @bitrate/web-player lint
pnpm --filter @bitrate/web-player check-types
pnpm --filter @bitrate/web-player test:unit
pnpm --filter @bitrate/api test
```

Choose checks for the changed behavior; root `lint`, `check-types`, `test` and `build` cover
broader work. Branches, commits, changesets and PR gates are in [CONTRIBUTING.md](CONTRIBUTING.md).
Python and Claude Code are not prerequisites for these application commands.

## How to AI

The repository configures **[Claude Code](https://www.claude.com/product/claude-code)**. AI
assistance is optional for development; other coding clients are individual developer choices.
The requirements below describe the current checked-in implementation, including its
[Python](https://www.python.org) helpers.

### Requirements — Claude Code workflow

| Requirement | Version / condition | Purpose |
|---|---|---|
| Development tools above | For the workspace being changed | Agents use the same build/test tools as developers |
| [Claude Code](https://www.claude.com/product/claude-code) | Installed and authenticated; configuration audited with CLI 2.1.278 | Load `CLAUDE.md`, `.claude/` hooks, commands and skills |
| [Python 3](https://www.python.org) on `PATH` as `python3` | Helpers verified with Python 3.12 | Secret/Git guard, formatting dispatcher, resource checks and verification evidence |
| [Bash](https://www.gnu.org/software/bash/) + [Git](https://git-scm.com) | Git must support [worktrees](https://git-scm.com/docs/git-worktree) and `rev-parse --path-format=absolute` | Hook entrypoints, repository detection and isolated writing agents |
| Linux or [WSL2](https://learn.microsoft.com/windows/wsl/) | Required for the complete resource-controlled workflow | Heavy-check helpers read `/proc` and use `fcntl`; native macOS/Windows parity is not established |
| [`mattpocock-skills`](https://github.com/mattpocock/skills) plugin | Must expose `grilling` and `tdd` | Approved interview/plan workflow for large tasks and TDD for logic/API/bugs |

Missing Python is not silently ignored: the pre-tool protection hook blocks tool calls.
These helpers currently use the Python standard library; the instruction validator has
one additional dependency listed below. `pnpm install` does not install Python or Claude Code.

### Optional and task-specific AI tools

| Tool | Needed when |
|---|---|
| [`uv`](https://docs.astral.sh/uv/) + [PyYAML](https://pyyaml.org) | Maintaining instruction metadata/links/scopes with `check-instructions.py`; PyYAML is not required by normal hooks |
| [`gh`](https://cli.github.com) + [`jq`](https://jqlang.org) | Running issue/PR/board helpers and `/br-auto`; authenticate `gh` and grant the access required by the requested operation |
| [RTK](https://github.com/rtk-ai/rtk) | Filtering shell output; required on `PATH` if your personal RTK hook is enabled |
| [Graphify](https://pypi.org/project/graphifyy/) + its Python environment ([`uv`](https://docs.astral.sh/uv/) or [`pip`](https://pip.pypa.io)) | Exploring an existing knowledge graph or explicitly building/updating it |
| [`typescript-language-server`](https://github.com/typescript-language-server/typescript-language-server) + [TypeScript](https://www.typescriptlang.org) on the Claude process's `PATH` | Using the TypeScript LSP plugin; enabling the plugin alone does not install its binaries |
| [MCP](https://modelcontextprotocol.io) servers / browser binaries / service access | Only for the task's integrations; see the [MCP reference](.claude/references/mcp.md) |

### Start and verify

From the repository root, after installing the required tools:

```bash
claude --version
python3 --version
bash --version
git worktree list
claude plugin details mattpocock-skills@claude-plugins-official
claude
```

If Matt Pocock's plugin is missing, install it for your local checkout with
`claude plugin install mattpocock-skills@claude-plugins-official --scope local`.
In Claude, inspect `/hooks`, `/plugin` and `/context all`. Personal/global settings can add
plugins, skills, MCP connections and hooks beyond what this repository configures.

Before a large task, Claude runs the grill-me interview and waits for confirmation of the
plan; resumed approved work reuses those decisions. Logic/API/bug changes use
[TDD](https://en.wikipedia.org/wiki/Test-driven_development). Ordinary tasks stay in-session,
and writing delegates use worktrees. Follow the [agent workflow](.claude/README.md) for
commands, approvals and execution boundaries.

Maintaining the AI configuration has its own checks:

```bash
python3 -B -m unittest discover -s .claude/hooks/tests -v
uv run --no-project --with pyyaml python .claude/scripts/check-instructions.py
```

`uv` resolves PyYAML for the second command; its first run may download dependencies.
For heavy application checks launched by Claude, use the resource-controlled runner:

```bash
python3 -B .claude/scripts/run-heavy.py -- pnpm --filter @bitrate/web-player check-types
```

See [verification requirements](.claude/references/verification.md) for resource limits and
[context troubleshooting](.claude/TOKEN_BUDGET.md) for measured usage. Teams, autonomous
pipelines and provider proxies are optional; they are not prerequisites for normal AI work.

## Tech Stack

Versions are the ones actually resolved in the workspace, not aspirations. Where a choice has a
reason that is easy to get wrong, the reason is in the linked rule rather than repeated here.

### Backend — `apps/api`

- **Runtime:** [NestJS](https://nestjs.com) 11 on [Node.js](https://nodejs.org) 24,
  [TypeScript](https://www.typescriptlang.org) 6.
- **Database:** [PostgreSQL](https://www.postgresql.org) 16 through [Prisma](https://www.prisma.io) 7,
  whose datasource lives in `prisma.config.ts` rather than in the schema.
- **Queues and cache:** [Redis](https://redis.io) 7 via [ioredis](https://github.com/redis/ioredis),
  backing both [BullMQ](https://bullmq.io) 5 job queues and the
  [throttler](https://github.com/nestjs/throttler)'s storage.
- **Real-time:** [Socket.IO](https://socket.io) 4 — single-instance only until a
  [Redis adapter](https://socket.io/docs/v4/redis-adapter/) is added.
- **Validation:** [Zod](https://zod.dev) 4 through [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod),
  so DTOs and their runtime checks cannot drift.
- **Auth:** [JWT](https://jwt.io) with [argon2](https://github.com/ranisalt/node-argon2) hashing plus
  [Google](https://developers.google.com/identity/protocols/oauth2) and
  [Facebook](https://developers.facebook.com/docs/facebook-login/) [OAuth](https://oauth.net/2/).
- **API docs:** [Swagger](https://swagger.io) generated from decorators kept in `decorators/`, never inline.
- **Other:** mail goes out through [Nodemailer](https://nodemailer.com), audio is probed with
  [music-metadata](https://github.com/Borewit/music-metadata), [Helmet](https://helmetjs.github.io)
  sets the security headers.
- **Observability:** errors and traces go to [Sentry](https://sentry.io)
  ([`@sentry/nestjs`](https://docs.sentry.io/platforms/javascript/guides/nestjs/) 10 with the
  profiling integration), sampled at 10% in production. Metrics and the optional
  [Prometheus](https://prometheus.io)/[Grafana](https://grafana.com) stack are documented in
  [the observability guide](infra/observability/README.md).
- **Tests:** [Jest](https://jestjs.io) 30 in three layers — unit with
  [`jest-mock-extended`](https://github.com/marchaos/jest-mock-extended), integration through
  [SuperTest](https://github.com/ladjs/supertest), and E2E against real Postgres and Redis.

### Web — `apps/web-player`, `apps/web-artists`

- **Frameworks:** the web player uses [Next.js](https://nextjs.org) 16
  [App Router](https://nextjs.org/docs/app); the artists portal uses
  [TanStack Start](https://tanstack.com/start) with [Vite](https://vite.dev) and
  [Nitro](https://nitro.build). Both use [React](https://react.dev) 19.
- **Architecture:** [Feature-Sliced Design](https://feature-sliced.design) — imports flow
  `app → views → widgets → features → entities → shared` and never upward.
- **Server state:** [TanStack Query](https://tanstack.com/query) 5 over
  [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/), typed from the generated `@bitrate/contracts`.
- **Client state:** [Zustand](https://zustand.docs.pmnd.rs) 5 with a shared persistence factory.
- **Forms:** [React Hook Form](https://react-hook-form.com) with [Zod](https://zod.dev) resolvers.
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4 configured entirely in CSS
  [`@theme`](https://tailwindcss.com/docs/theme) layers — there is no `tailwind.config.js`.
- **Animation:** [Motion](https://motion.dev).
- **Tests:** [Vitest](https://vitest.dev) 4 and [Playwright](https://playwright.dev) 1.60.

### Admin — `apps/admin`

[Angular](https://angular.dev) 22 zoneless SPA with [spartan-ng](https://www.spartan.ng) components,
[Tailwind CSS](https://tailwindcss.com) v4, [ESLint](https://eslint.org) and [Vitest](https://vitest.dev).

### Shared UI — `packages/ui-react`

The design system and component library: [Base UI](https://base-ui.com) primitives,
[Tailwind CSS](https://tailwindcss.com) v4, [CVA](https://cva.style) variants merged through
`cn()`, [Lucide](https://lucide.dev) icons, built with [Vite](https://vite.dev) 8.
[Storybook](https://storybook.js.org) 10 is published at [ui.bitrate.me](https://ui.bitrate.me).
Four co-located [Vitest](https://vitest.dev) projects per component — unit, integration, DOM
snapshot, and [Chromium](https://www.chromium.org) screenshot through
[`@vitest/browser-playwright`](https://vitest.dev/guide/browser/).

### Player — `packages/player`

[Svelte](https://svelte.dev) 5 [custom element](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements)
built with [Vite](https://vite.dev) 8; a framework-free contract that any host app can embed.

### Mobile — `apps/mobile`

[React Native](https://reactnative.dev) 0.81 on [Expo](https://expo.dev) SDK 54 with
[Expo Router](https://docs.expo.dev/router/introduction/) 6 and
[Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4. Scaffolded, not started; the
web conventions above deliberately do not apply there.

### Desktop — `apps/desktop`

[Tauri](https://v2.tauri.app) 2 shell around a [React](https://react.dev) 19 renderer built by
[Vite](https://vite.dev) 8. Also scaffolded rather than built out.

### Documentation — `apps/docs`

[Docusaurus](https://docusaurus.io) 3.10 with the [Mermaid](https://mermaid.js.org)
[theme](https://docusaurus.io/docs/markdown-features/diagrams), published at
[docs.bitrate.me](https://docs.bitrate.me). Architecture decisions live here as
[ADRs](https://adr.github.io).

### Shared packages

| Package | Purpose |
|---|---|
| `@bitrate/contracts` | [OpenAPI](https://www.openapis.org) types generated from the running API |
| `@bitrate/ui-react` | Components and design tokens |
| `@bitrate/player` | Embeddable audio player custom element |
| `@bitrate/svgr`, `@bitrate/vite-svgr` | [SVG](https://developer.mozilla.org/docs/Web/SVG) sources compiled to React components at build time with [SVGR](https://react-svgr.com) |
| `@bitrate/converter`, `@bitrate/ncs-parser` | Media utilities |

### Tooling and delivery

- **Monorepo:** [Turborepo](https://turborepo.com) over [pnpm](https://pnpm.io) 12 workspaces.
- **Code quality:** [Biome](https://biomejs.dev) for lint and format,
  [Lefthook](https://github.com/evilmartians/lefthook) for git hooks,
  [Changesets](https://github.com/changesets/changesets) for versioning.
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) builds five
  [Docker](https://www.docker.com) images per release and pushes them to
  [GHCR](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry);
  production pulls those images rather than building, behind a required-reviewer gate.
- **Runtime:** [Docker Compose](https://docs.docker.com/compose/) runs the stack, `Taskfile.yml`
  ([Task](https://taskfile.dev)) is the only interface to it. [nginx](https://nginx.org)
  terminates TLS for all six hostnames.

## License

[MIT](https://opensource.org/license/mit) © 2025 Lordpluha — see [LICENSE](LICENSE).
