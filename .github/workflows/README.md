# CI/CD Workflows

This document summarizes all GitHub Actions workflows in this repository: what they do and when they run.

## Chromatic ([chromatic.yml](chromatic.yml))
**Triggers**
- `pull_request` targeting `develop`.

**Purpose**
- Build `@spotify/ui-react` Storybook and publish to Chromatic.

## Production Deploy ([deploy.yml](deploy.yml))
**Triggers**
- `workflow_dispatch` with `environment` input (`staging` or `production`).
- `push` to `master` when changes touch `apps/**`, `packages/**`, or `docker-compose.prod.yaml`.

**Purpose**
- Build/push Docker images (api/web/admin) and deploy to server via SSH.
- Health check after deploy.

## Desktop Build ([desktop.yml](desktop.yml))
**Triggers**
- `push` to `main` or `develop` when `apps/desktop/**` changes.
- `pull_request` to `main` or `develop` when `apps/desktop/**` changes.

**Purpose**
- Build Tauri desktop apps for Linux, Windows, macOS.
- Run basic UI health check for the desktop web UI.

## Docker CI/CD ([docker.yml](docker.yml))
**Triggers**
- `push` to `master` or `develop` when `apps/**`, `packages/**`, `docker-compose*.yaml`, or the workflow changes.
- `pull_request` to `master` or `develop` when `apps/**` or `packages/**` changes.

**Purpose**
- Detect changed services and build Docker images for `api/web-player/web-artists/admin`.
- Run Trivy security scans (push only).
- Run integration tests with docker-compose.

## Mobile Build ([mobile.yml](mobile.yml))
**Triggers**
- `push` to `master` or `develop` when `apps/mobile/**` changes.
- `pull_request` to `master` or `develop` when `apps/mobile/**` changes.

**Purpose**
- Build Expo dev server and verify Metro status.
- Build Expo Web (Docker) and upload artifacts.
- Build Android/iOS with EAS on `push` (master/develop) only.

## Continuous Monitoring ([monitoring.yml](monitoring.yml))
**Triggers**
- Scheduled: every 6 hours (`0 */6 * * *`).
- `workflow_dispatch`.

**Purpose**
- Production health checks (master branch only).
- Dependency update check and issue creation.
- Docker image size monitoring.
- SSL certificate expiry check.
- Backup verification placeholder.

## Performance Testing ([performance.yml](performance.yml))
**Triggers**
- `pull_request` when changes touch `apps/api/**`, `apps/web-player/**`, or `apps/web-artists/**`.
- Scheduled weekly (`0 2 * * 1`) for `develop` and `master`.
- `workflow_dispatch`.

**Purpose**
- API load test (Postgres + Redis services, k6).
- Lighthouse CI for `web-player`.
- Bundle analysis for `web-player` (PRs only).
- DB performance prep (migrations/seed).

## PR Quality Checks ([pull_request.yml](pull_request.yml))
**Triggers**
- `pull_request` on `opened`, `synchronize`, `reopened`.

**Purpose**
- Lint/format/type checks.
- Build & test with services (Postgres/Redis).
- Optional Docker build when PR has label `docker` or title contains `[docker]`.
- PR summary comment.

## Release ([release.yml](release.yml))
**Triggers**
- `push` of tags matching `v*.*.*`.

**Purpose**
- Create GitHub Release with changelog.
- Publish Docker images.
- Build desktop apps for all OSes and attach to release.
- Publish npm packages (if `NPM_TOKEN` is set).

## Security Checks ([security.yml](security.yml))
**Triggers**
- `push` to `master` or `develop`.
- Scheduled weekly (`0 0 * * 0`) for `develop` and `master`.
- `workflow_dispatch`.

**Purpose**
- `pnpm audit` (non-blocking).
- Secret scanning (TruffleHog, non-blocking).
- CodeQL analysis.
