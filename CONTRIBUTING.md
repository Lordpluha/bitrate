# Contributing to Music Platform (Spotify Clone)

Thank you for your interest in the project! We welcome any contribution — whether it's bug fixes, new features, documentation improvements, or code refactoring.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Branch Naming](#branch-naming)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/spotify-clone.git
   cd spotify-clone
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
- Web developers should use `pnpm push:web` to save time
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
feat(web): add playlist page
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
- `web` - Web application (Next.js)
- `mobile` - Mobile application (React Native)
- `api` - Backend API (NestJS)
- `admin` - Admin panel
- `desktop` - Desktop application (Tauri)
- `docs` - Documentation
- `contracts` - API contracts
- `ui` - UI components
- `infra` - Infrastructure (Docker, CI/CD)

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

### Automatic formatting

```bash
# Check code
pnpm lint

# Fix automatically
pnpm format
```

### Pre-commit hook

On commit, `lint-staged` is automatically triggered, which formats changed files.

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

2. **Run tests:**
   ```bash
   pnpm test  # If there are tests for your change
   ```

3. **Check linting:**
   ```bash
   pnpm lint
   ```

4. **Run a full build:**
   ```bash
   git push  # Runs pre-push hook with build
   ```

### Creating a PR

1. **Title** should be descriptive:
   ```
   feat(web): add playlist page
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
# Unit tests (all)
pnpm test

# API tests
pnpm --filter @spotify/api test        # unit
pnpm --filter @spotify/api test:int    # integration (needs DB)
pnpm --filter @spotify/api test:e2e    # E2E

# Web player E2E (Playwright)
pnpm --filter @spotify/web-player test:e2e

# Mobile
pnpm --filter @spotify/mobile test
```

### Test coverage

Try to cover with tests:
- Critical business logic
- Utility functions
- API endpoints
- UI components (integration tests)

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
