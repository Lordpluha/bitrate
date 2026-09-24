# Bitrate

**All-in-one for musicians.** A Turborepo + pnpm monorepo holding the listener app, the artists
portal, the API and the shared design system, plus mobile and desktop shells that are scaffolded
but not yet built out.

Everything beyond this page lives at **[docs.bitrate.me](https://docs.bitrate.me)** — start with
[Introduction](https://docs.bitrate.me/docs/getting-started/introduction) for the map, or
[Architecture](https://docs.bitrate.me/docs/getting-started/architecture) for how the pieces fit.

- [How to start](#how-to-start) — run the Docker stack.
- [How to develop](#how-to-develop) — host tooling, native servers and checks.
- [How to AI](#how-to-ai) — Claude Code requirements and optional integrations.

## Live sites

Five sites on one VPS behind one nginx, all served from images CI builds — see
[Deployment](apps/docs/docs/infrastructure/deployment.md).

| Site | URL |
|---|---|
| Web player | https://bitrate.me |
| Artists portal | https://artists.bitrate.me |
| API | https://api.bitrate.me · [Swagger](https://api.bitrate.me/swagger) |
| Documentation | https://docs.bitrate.me |
| Component workshop | https://ui.bitrate.me |

## How to start

Use this path to run the web stack in Docker. For editing code and running checks on the
host, continue with [How to develop](#how-to-develop).

### Requirements — run the Docker stack

| Requirement | Version / condition | Purpose |
|---|---|---|
| Git | 2.x | Clone the repository |
| Docker Engine or Docker Desktop | Engine 24+ with the daemon running | Build and run application/infrastructure containers |
| Docker Compose | v2, available as `docker compose` | Compose stacks in `infra/` |
| Task (go-task) | v3 | Repository Docker and database commands |

This path runs Node.js and pnpm inside containers. Host Python, Rust and AI tools are not
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

Default Docker addresses: API/Swagger `http://localhost:3000/swagger`, web player
`http://localhost:3001`, artists portal `http://localhost:3004`, admin `http://localhost:3005`.
Mobile, desktop, docs and monitoring use separate profiles/tasks.

The development Compose files supply local defaults; no repository-root `.env` is needed.
Export shell variables to override them, for example `POSTGRES_PORT=5433 task infra:up`.
Production deployment uses GitHub environment secrets/variables and its separate deployment
workflow. See [the setup guide](apps/docs/docs/getting-started/setup.md) for other launch paths.

## How to develop

### Requirements — edit, build and test

| Requirement | Version / condition | Purpose |
|---|---|---|
| Git | 2.x | Branches, commits and hooks |
| Node.js | >=24; `.nvmrc` selects v24 | Run workspace tools and native application servers |
| pnpm | **10.30.3**, pinned in `package.json` | Install the workspace and run scripts |
| Docker Compose + Task | As above, when using local API infrastructure | PostgreSQL/Redis and database tasks |
| Bash and standard shell utilities | For repository shell scripts and hooks; WSL2 on Windows for these commands | Local automation |

[package.json](package.json) owns the Node floor and package-manager version. Use pnpm for
this workspace; the package lockfile is `pnpm-lock.yaml`.

```bash
# If using nvm:
nvm install
nvm use

npm install --global pnpm@10.30.3
node --version
pnpm --version

# Install application dependencies without optional AI-tool setup (Bash/WSL):
SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install
```

The two flags skip only the repository's optional Graphify/RTK installers. Package build
scripts and Lefthook setup still run. A plain `pnpm install` also attempts those AI-tool
installers: Graphify uses an available `uv`/`pip`, and RTK's installer can configure a
**global Claude hook**. Use the same flags on later installs when you do not want that setup.

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
| Browser E2E / screenshot tests | Playwright browser binaries and their OS libraries; for web-player: `pnpm --filter @bitrate/web-player exec playwright install chromium` |
| API E2E | Running test PostgreSQL/Redis and the test environment described in the [testing guide](apps/docs/docs/guides/testing.md) |
| Mobile | Expo-compatible device/emulator; Android SDK or macOS/Xcode for the corresponding native target — [mobile setup](apps/mobile/README.md) |
| Desktop native app | Rust/Cargo and platform WebView/build dependencies — [desktop setup](apps/desktop/README.md); frontend-only Vite work needs no Rust |
| GitHub CLI workflows | Authenticated `gh` with access to the relevant repository/project; not required for local builds |

Linters, test runners, TypeScript and formatters come from workspace dependencies; use the
owning package's scripts. For example:

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

The repository configures **Claude Code**. AI assistance is optional for development;
other coding clients are individual developer choices. The requirements below describe
the current checked-in implementation, including its Python helpers.

### Requirements — Claude Code workflow

| Requirement | Version / condition | Purpose |
|---|---|---|
| Development tools above | For the workspace being changed | Agents use the same build/test tools as developers |
| Claude Code | Installed and authenticated; configuration audited with CLI 2.1.278 | Load `CLAUDE.md`, `.claude/` hooks, commands and skills |
| Python 3 on `PATH` as `python3` | Helpers verified with Python 3.12 | Secret/Git guard, formatting dispatcher, resource checks and verification evidence |
| Bash + Git | Git must support worktrees and `rev-parse --path-format=absolute` | Hook entrypoints, repository detection and isolated writing agents |
| Linux or WSL2 | Required for the complete resource-controlled workflow | Heavy-check helpers read `/proc` and use `fcntl`; native macOS/Windows parity is not established |
| `mattpocock-skills` plugin | Must expose `grilling` and `tdd` | Approved interview/plan workflow for large tasks and TDD for logic/API/bugs |

Missing Python is not silently ignored: the pre-tool protection hook blocks tool calls.
These helpers currently use the Python standard library; the instruction validator has
one additional dependency listed below. `pnpm install` does not install Python or Claude Code.

### Optional and task-specific AI tools

| Tool | Needed when |
|---|---|
| `uv` + PyYAML | Maintaining instruction metadata/links/scopes with `check-instructions.py`; PyYAML is not required by normal hooks |
| `gh` + `jq` | Running issue/PR/board helpers and `/br-auto`; authenticate `gh` and grant the access required by the requested operation |
| RTK | Filtering shell output; required on `PATH` if your personal RTK hook is enabled |
| Graphify + its Python environment (`uv` or `pip`) | Exploring an existing knowledge graph or explicitly building/updating it |
| `typescript-language-server` + TypeScript on the Claude process's `PATH` | Using the TypeScript LSP plugin; enabling the plugin alone does not install its binaries |
| MCP servers / browser binaries / service access | Only for the task's integrations; see the [MCP reference](.claude/references/mcp.md) |

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
plan; resumed approved work reuses those decisions. Logic/API/bug changes use TDD. Ordinary
tasks stay in-session, and writing delegates use worktrees. Follow the
[agent workflow](.claude/README.md) for commands, approvals and execution boundaries.

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

NestJS 11 on Node 24, TypeScript 6. PostgreSQL 16 through Prisma 7, whose datasource lives in
`prisma.config.ts` rather than in the schema. Redis 7 via ioredis, backing both BullMQ 5 job queues
and the throttler's storage. Socket.io 4 for real-time — single-instance only until a Redis adapter
is added. Validation is Zod 4 through nestjs-zod, so DTOs and their runtime checks cannot drift.
Auth is JWT with argon2 hashing plus Google and Facebook OAuth. Swagger is generated from
decorators kept in `decorators/`, never inline. Mail goes out through nodemailer, audio is probed
with music-metadata, helmet sets the security headers.

Errors and traces go to Sentry (`@sentry/nestjs` 10 with the profiling integration), sampled at 10%
in production. Metrics and the optional Prometheus/Grafana stack are documented in
[the observability guide](infra/observability/README.md).

Tests are Jest 30 in three layers: unit with `jest-mock-extended`, integration through supertest,
and E2E against real Postgres and Redis.

### Web — `apps/web-player`, `apps/web-artists`

The web player uses Next.js 16 App Router; the artists portal uses TanStack Start with
Vite and Nitro. Both use React 19 and Feature-Sliced Design — imports flow
`app → views → widgets → features → entities → shared` and never upward. Server state is TanStack
Query 5 over `openapi-fetch`, typed from the generated `@bitrate/contracts`; client state is
Zustand 5 with a shared persistence factory. Forms are React Hook Form with Zod resolvers. Styling
is Tailwind v4 configured entirely in CSS `@theme` layers — there is no `tailwind.config.js`.
Animation is Motion. Tests are Vitest 4 and Playwright 1.60.

### Shared UI — `packages/ui-react`

The design system and component library: Base UI primitives, Tailwind v4, CVA variants merged
through `cn()`, Lucide icons, built with Vite 8. Storybook 10 is published at `ui.bitrate.me`. Four
co-located Vitest projects per component — unit, integration, DOM snapshot, and Chromium screenshot
through `@vitest/browser-playwright`.

### Mobile — `apps/mobile`

React Native 0.81 on Expo SDK 54 with expo-router 6 and Reanimated 4. Scaffolded, not started; the
web conventions above deliberately do not apply there.

### Desktop — `apps/desktop`

Tauri 2 shell around a React 19 renderer built by Vite 8. Also scaffolded rather than built out.

### Documentation — `apps/docs`

Docusaurus 3.10 with the Mermaid theme, published at `docs.bitrate.me`. Architecture decisions live
here as ADRs.

### Shared packages

`@bitrate/contracts` — OpenAPI types generated from the running API.
`@bitrate/ui-react` — components and design tokens.
`@bitrate/svgr` and `@bitrate/vite-svgr` — SVG sources compiled to React components at build time.
`@bitrate/converter`, `@bitrate/ncs-parser` — media utilities.

### Tooling and delivery

Turborepo over pnpm 10 workspaces. Biome for lint and format, Lefthook for git hooks, Changesets for
versioning. GitHub Actions builds five Docker images per release and pushes them to GHCR; production
pulls those images rather than building, behind a required-reviewer gate. Docker Compose runs the
stack, `Taskfile.yml` is the only interface to it. nginx terminates TLS for all six hostnames.

## License

MIT © 2025 Lordpluha — see [LICENSE](LICENSE).
