# Contributing to Bitrate

Thank you for your interest in the project! We welcome any contribution — whether it's bug fixes, new features, documentation improvements, or code refactoring.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Branch Naming](#branch-naming)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Agent Workflow](#agent-workflow)
- [Architecture and UX](#architecture-and-ux)

---

## 🚀 Getting Started

Planned and in-flight work lives on the [Projects board](https://github.com/users/Lordpluha/projects/6); pick something from `Todo`
or open an issue before starting anything substantial.

1. **Fork the repository** on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bitrate.git
   cd bitrate
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. **Make changes** and commit
6. **Push** to your fork:
   ```bash
   git push  # runs pre-push hook (full build)
   # or WEB_ONLY=true git push  (web-player only)
   ```
7. **Create a Pull Request** to the main repository

---

## 📤 Git Workflow

### Push options with different verification levels

When running `git push`, a pre-push hook is automatically triggered that builds the project. The following options are available:

#### 🏗️ Full monorepo build (default)
```bash
git push
```
Builds all applications in the monorepo before push. **Use before creating a PR.**

#### 🌐 Web apps only (for web developers)
```bash
WEB_ONLY=true git push
```
Builds only api + web-player + ui-react, saving time for web developers.

#### ⚡ Skip all checks
```bash
LEFTHOOK=0 git push
```
Completely disables all lefthook hooks (build, linting, commit checks).

**Recommendations:**
- Web developers should use `WEB_ONLY=true git push` to save time
- Run a full build **before important PRs or releases**
- Use `LEFTHOOK=0` **only for hotfixes** or urgent documentation changes

---

## 💬 Commit Guidelines

The project uses [Conventional Commits](https://www.conventionalcommits.org/) with automatic validation via `commitlint`.

### Interactive mode (recommended)

```bash
pnpm commit
```

This command launches an interactive commit wizard with prompts.

### Commit format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```bash
feat(web-player): add playlist page
fix(api): fix memory leak in auth middleware
docs(readme): update installation instructions
refactor(mobile): optimize track list rendering
```

### Commit types

| Type | Description |
|------|-------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code formatting (no behavior change) |
| `refactor` | Refactoring (no bugfixes/features) |
| `perf` | Performance optimization |
| `test` | Adding/updating tests |
| `build` | Build or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Minor tasks with no code impact |
| `revert` | Reverting changes |

### Scopes (optional)

Scope indicates the part of the project:
- `web-player` - Web application (Next.js)
- `mobile` - Mobile application (React Native)
- `api` - Backend API (NestJS)
- `desktop` - Desktop application (Tauri)
- `docs` - Documentation
- `contracts` - API contracts
- `ui-react` - Shared UI component library
- `tokens` - Design tokens
- `ci` - CI/CD configuration

### Breaking Changes

For breaking changes, add `!` after type/scope or use the footer:

```bash
feat(api)!: change response format for /auth/login

BREAKING CHANGE: the `user` field is now called `userData`
```

---

## 🌿 Branch Naming

Use the following format for branches:

```
<type>/<short-description>
```

**Examples:**

```bash
feat/add-playlist-page
fix/memory-leak-auth
docs/update-readme
refactor/optimize-track-list
chore/upgrade-dependencies
```

**Branch types:**
- `feat/` - new functionality
- `fix/` - bug fix
- `docs/` - documentation
- `refactor/` - refactoring
- `chore/` - technical tasks
- `test/` - adding tests
- `hotfix/` - urgent production fix

---

## 🎨 Code Style

The project uses **Biome** for linting and code formatting.

[`CODE_STYLE.md`](CODE_STYLE.md) is the stable entry point. The complete rules live in
[`CLAUDE.md`](CLAUDE.md) and [`.claude/rules/`](.claude/rules/).

### Automatic formatting

```bash
# Check code
pnpm lint

# Fix automatically
pnpm format
```

### Git hooks

Lefthook validates commits and performs the configured pre-push build. Do not rely on hooks
as the only verification; run the relevant package checks before opening a PR.

### Main rules

- Use **TypeScript** for all code
- **2 spaces** for indentation
- **Single quotes** for strings
- **Trailing commas** in objects and arrays
- **No semicolons**
- Maximum line length: **100 characters**
- Use **async/await** instead of promises
- Name variables in **English**

---

## 🔄 Pull Request Process

### Before creating a PR

1. **Make sure the code works:**
   ```bash
   pnpm dev  # Run the project locally
   ```

2. **Run relevant tests:**
   ```bash
   pnpm --filter @bitrate/api test
   pnpm --filter @bitrate/ui-react test
   ```

3. **Check linting and types:**
   ```bash
   pnpm lint
   pnpm check-types
   ```

4. **Check unused code when exports/dependencies changed:**
   ```bash
   pnpm knip
   ```

5. **Run a full build:**
   ```bash
   git push  # Runs pre-push hook with build
   ```

### Creating a PR

1. **Title** should be descriptive:
   ```
   feat(web-player): add playlist page
   ```

2. **Description** should contain:
   - What changed and why
   - Screenshots (for UI changes)
   - Link to related issue (if any)

3. **Checklist:**
   - [ ] Code follows project code style
   - [ ] Tests added/updated (if applicable)
   - [ ] Documentation updated (if applicable)
   - [ ] All tests pass
   - [ ] Build passes successfully
   - [ ] Verified locally

### Code Review

- Be open to constructive criticism
- Respond to reviewer comments
- Make requested changes

---

## 🧪 Testing

### Running tests

```bash
# API tests
pnpm --filter @bitrate/api test        # unit
pnpm --filter @bitrate/api test:int    # integration (no real DB needed — uses prismaMock)
pnpm --filter @bitrate/api test:e2e    # E2E

# Shared UI tests
pnpm --filter @bitrate/ui-react test
pnpm --filter @bitrate/ui-react test:unit
pnpm --filter @bitrate/ui-react test:int
pnpm --filter @bitrate/ui-react test:snapshot
pnpm --filter @bitrate/ui-react test:screenshot

# Web player tests
pnpm --filter @bitrate/web-player test:unit
pnpm --filter @bitrate/web-player test:int
pnpm --filter @bitrate/web-player test:e2e
pnpm --filter @bitrate/web-player test:screenshot

```

### Test coverage

Try to cover with tests:
- Critical business logic
- Utility functions
- API endpoints
- UI components (integration tests)

Test files follow the runner owned by their package. See
[`apps/docs/docs/guides/testing.md`](apps/docs/docs/guides/testing.md).

---

## 🤖 Agent Workflow

The optional repository agent layer lives under [`.claude/`](.claude/). Project agents use
the same rules as human contributors:

| Intent | Command |
|---|---|
| Draft or restructure a GitHub task against the whole board | `/br-create-task "<idea>" [--dry-run]` |
| Implement application or package work, then open/update the PR | `/br-implement "<task>" [--session]` |
| Drive `Todo`-column issues end to end, unattended | `/br-auto [--limit N] [--issue NNN]` |
| Find/fix drift across `.claude/`, `.changeset/`, `apps/docs/`, `PRODUCT.md`, root onboarding docs (run periodically) | `/br-sync-docs [--session]` |

Ticket and board state aren't mirrored anywhere — these commands query GitHub live (via
`gh`/MCP) whenever they need it. That requires the `gh` CLI, authenticated, with the
`read:project` scope for board access (`gh auth refresh -s read:project,project`).

All four commands dispatch to an agent by default now. `/br-implement` routes to the
specialist that owns the surface: `br-frontend-developer` (web-player, web-artists,
ui-react), `br-backend-developer` (api), `br-mobile-developer`, `br-desktop-developer`,
or `br-devops` (CI, Docker, infra, release) — plus `br-planner` for
plans, `br-debugger` for bug fixes, `br-tester` for tests, and `br-reviewer` for review
(also auto-invoked on large diffs). `/br-sync-docs` routes to `br-librarian`; `/br-auto`
runs `br-worker` in its own git worktree per issue. Pass `--session` on any of them to
work in the current session instead. None of the specialists have their own slash command;
each command is the single entrypoint that dispatches to its own. This also applies to
ordinary tasks outside any command — see `CLAUDE.md`'s "Default to agent dispatch, even
outside a command".

For an effort too large or too vague for one command, install `mattpocock-skills`
(`claude plugin install mattpocock-skills`): `/grill-me` interviews the idea into shape
before planning, and `/wayfinder` charts a multi-session effort as decision tickets on the
tracker.

Agents confirm before every mutating GitHub action (board card moves, issue comments,
`git push`, PR create/edit) — a prior approval in a conversation does not carry over to a
later action. Agents do not create releases unless explicitly asked.

---

## 🏗️ Architecture and UX

- Architecture decisions: [`apps/docs/docs/architecture/`](apps/docs/docs/architecture/)
- Design specifications: [`apps/docs/docs/specs/`](apps/docs/docs/specs/)
- Persistent implementation plans: [`apps/docs/docs/plans/`](apps/docs/docs/plans/)
- Design token contract: [`apps/docs/docs/brand/tokens.md`](apps/docs/docs/brand/tokens.md)
- Accessibility baseline: [`apps/docs/docs/brand/a11y.md`](apps/docs/docs/brand/a11y.md)
- Working conventions: [`CLAUDE.md`](CLAUDE.md)

New durable architectural choices should get an ADR. Cross-cutting designs may start as a
spec and then an implementation plan. New visual values should enter
the `@theme`/`:root.light` part-file in `packages/ui-react/src/styles/` that owns the role,
not component literals. User-facing web changes must preserve
the WCAG 2.2 AA baseline.

---

## 📦 Versioning (Changesets)

After making changes to a package, describe what changed:

```bash
pnpm changeset
# Select affected packages → bump level (patch/minor/major)
# Commit the generated .changeset/*.md file alongside your code
```

Skip this step only for `docs`, `ci`, or `chore` commits that don't affect package behaviour.

---

## 🤝 Community Guidelines

- Be respectful to other participants
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
- Report vulnerabilities according to the [Security Policy](SECURITY.md)
- Ask questions in Issues or Discussions
- Help other participants

---

## 📝 License

By contributing to this project, you agree that your code will be distributed under the [MIT](LICENSE) license.

---

**Thank you for your contribution! 🎉**

If you have questions, feel free to create an issue or reach out to the maintainers.
