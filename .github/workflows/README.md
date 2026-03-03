# CI/CD Workflows

This document summarizes all GitHub Actions workflows in this repository: what they do and when they run.

## Naming Convention
Workflow names in GitHub Actions UI follow this pattern:
- `[app-or-domain][type] Title`
- `type` is one of: `pr`, `develop`, `master` (or combined when one workflow handles multiple branches).
- examples: `[mobile][pr+develop+master] Build`, `[monorepo][pr] Quality Checks`

## Transition Notes
- App-scoped workflows (`<app>_pr.yml`, `<app>_develop.yml`, `<app>_master.yml`) are the primary CI/CD entry points.
- Build steps are docker-only in workflows and use GHCR-backed Buildx cache (`type=registry`) with `type=gha` fallback.
- Legacy `mobile.yml` and `desktop.yml` were switched to `workflow_dispatch` only to avoid duplicate runs.
- Shared `pull_request.yml` and `docker.yml` now run only for shared/infra changes.
- `performance.yml` on PR now runs only when PR has label `performance` (or title contains `[performance]`).
- `ui_react_pr.yml` and `ui_react_develop.yml` run Loki automatically when `packages/ui-react/**` changes.
- `ui_react_*` workflows call `loki_reusable.yml` for shared Loki steps.
- `deploy.yml` is manual-only and supports per-service deploy (`all`, `api`, `web-player`, `web-artists`, `admin`).

## Shared actions
Common setup steps were moved into composite actions to keep workflows DRY:
- .github/actions/setup-node-pnpm: setup Node.js + pnpm (optional install)
- .github/actions/setup-docker: setup Docker Buildx (optional QEMU) + optional GHCR login

## Pipeline Matrix (Current)

### Apps
| App | PR | Develop | Master |
|---|---|---|---|
| web-artists | `web_artists_pr.yml`, `docker.yml`, `performance.yml`, `pull_request.yml` | `web_artists_develop.yml`, `docker.yml`, `security.yml` | `web_artists_master.yml`, `deploy.yml` |
| web-player | `web_player_pr.yml`, `ui_react_pr.yml`, `docker.yml`, `performance.yml`, `pull_request.yml` | `web_player_develop.yml`, `ui_react_develop.yml`, `docker.yml`, `security.yml` | `web_player_master.yml`, `ui_react_master.yml`, `deploy.yml` |
| mobile | `mobile_pr.yml`, `mobile.yml`, `pull_request.yml` | `mobile_develop.yml`, `mobile.yml`, `security.yml` | `mobile_master.yml`, `mobile.yml` |
| desktop | `desktop_pr.yml`, `desktop.yml`, `pull_request.yml` | `desktop_develop.yml`, `desktop.yml`, `security.yml` | `desktop_master.yml`, `desktop.yml` |
| admin | `admin_pr.yml`, `docker.yml`, `pull_request.yml` | `admin_develop.yml`, `docker.yml`, `security.yml` | `admin_master.yml`, `deploy.yml` |
| api | `api_pr.yml`, `pull_request.yml`, `docker.yml`, `performance.yml` | `api_develop.yml`, `docker.yml`, `security.yml` | `api_master.yml`, `deploy.yml` |
| documentation | No dedicated workflow yet | No dedicated workflow yet | No dedicated workflow yet |

### Packages
| Package | PR | Deploy | Release |
|---|---|---|---|
| `@spotify/contracts` | Indirect checks via `pull_request.yml`, affects API/docker builds | Consumed by apps, no standalone deploy | Included via app releases |
| `@spotify/ui-react` | `ui_react_pr.yml` | `ui_react_develop.yml` | `ui_react_master.yml` |
| `@spotify/ui-flutter` | No dedicated workflow | No dedicated workflow | No dedicated workflow |
| `@spotify/ncs-parser` | Built in `performance.yml` | No standalone deploy | Included where consumed |
| `@spotify/esbuild-bundler` | Indirect via app/package builds | No standalone deploy | Included where consumed |
| `@spotify/load-test` | Used in `performance.yml` | No standalone deploy | No standalone release |
| `@spotify/svgr` | Indirect via `@spotify/ui-react` build | No standalone deploy | Included where consumed |
| `@spotify/tokens-generator` | Indirect via UI build scripts | No standalone deploy | Included where consumed |
| `@spotify/tokens` | Indirect via UI builds | No standalone deploy | Included where consumed |
| `@spotify/converter` | No dedicated workflow | No standalone deploy | No dedicated workflow |

## Workflow Organization (Recommended)
- Keep workflow intent strict: `pull_request.yml` for quality gates, `ui_react_*` for visual regressions, `docker.yml` for container CI/CD, `deploy.yml` only for server deploy.
- Add/maintain `paths` filters on specialized workflows (`ui_react`, `mobile`, `desktop`, `performance`) to reduce noisy runs.
- Keep release/deployment responsibilities in `*_master.yml` app workflows and `deploy.yml`.
- For packages without standalone publish flow, explicitly mark them as "indirectly validated" (as in the matrix above).
- Prefer reusable composite actions (`setup-node-pnpm`, `setup-docker`) to avoid drift in setup logic.

## Target State (Simple)
- PR: fast quality checks + relevant specialized checks only.
- Develop: continuous integration + security/monitoring.
- Master: build/publish artifacts + deployment.
- Every workflow should have one owner domain and one success criterion.

## API Dedicated Workflows
- `api_pr.yml` — app-scoped API checks for pull requests.
- `api_develop.yml` — app-scoped API checks on `develop` pushes.
- `api_master.yml` — app-scoped API build + image publish on `master` pushes.

## Web Dedicated Workflows
- `web_player_pr.yml` — app-scoped web-player checks for pull requests.
- `web_player_develop.yml` — app-scoped web-player checks on `develop` pushes.
- `web_player_master.yml` — app-scoped web-player build + image publish on `master` pushes.
- `web_artists_pr.yml` — app-scoped web-artists checks for pull requests.
- `web_artists_develop.yml` — app-scoped web-artists checks on `develop` pushes.
- `web_artists_master.yml` — app-scoped web-artists build + image publish on `master` pushes.

## UI-React Dedicated Workflows
- `ui_react_pr.yml` — visual tests for `@spotify/ui-react` on pull requests.
- `ui_react_develop.yml` — visual tests for `@spotify/ui-react` on `develop` pushes.
- `ui_react_master.yml` — visual tests for `@spotify/ui-react` on `master` pushes.
- `loki_reusable.yml` — reusable workflow with shared Loki steps.

## Mobile Dedicated Workflows
- `mobile_pr.yml` — app-scoped mobile checks for pull requests.
- `mobile_develop.yml` — app-scoped mobile checks on `develop` pushes.
- `mobile_master.yml` — app-scoped mobile master build (web + optional EAS production build).

## Desktop Dedicated Workflows
- `desktop_pr.yml` — app-scoped desktop checks for pull requests.
- `desktop_develop.yml` — app-scoped desktop checks on `develop` pushes.
- `desktop_master.yml` — app-scoped desktop master build and artifact upload.

## Admin Dedicated Workflows
- `admin_pr.yml` — app-scoped admin checks for pull requests.
- `admin_develop.yml` — app-scoped admin checks on `develop` pushes.
- `admin_master.yml` — app-scoped admin build + image publish on `master` pushes.

## [ui-react][pr] Visual Tests ([ui_react_pr.yml](ui_react_pr.yml))
**Triggers**
- `pull_request` targeting `develop` when `packages/ui-react/**` changes.

**Purpose**
- Call reusable workflow `loki_reusable.yml`.
- Build `@spotify/ui-react` Storybook and run Loki visual regression tests.

## [platform][master] Production Deploy ([deploy.yml](deploy.yml))
**Triggers**
- `workflow_dispatch` with `environment` input (`staging` or `production`).
- `workflow_dispatch` with `service` input (`all`, `api`, `web-player`, `web-artists`, `admin`).

**Purpose**
- Build/push Docker images for selected service(s) and deploy via SSH.
- Health check after deploy.

## [desktop][pr+develop+master] Build ([desktop.yml](desktop.yml))
**Triggers**
- `push` to `master` or `develop` when `apps/desktop/**` changes.
- `pull_request` to `master` or `develop` when `apps/desktop/**` changes.

**Purpose**
- Build Tauri desktop apps for Linux, Windows, macOS.
- Run basic UI health check for the desktop web UI.

## [apps][pr+develop+master] Docker CI/CD ([docker.yml](docker.yml))
**Triggers**
- `push` to `master` or `develop` when `apps/**`, `packages/**`, `docker-compose*.yaml`, or the workflow changes.
- `pull_request` to `master` or `develop` when `apps/**` or `packages/**` changes.

**Purpose**
- Detect changed services and build Docker images for `api/web-player/web-artists/admin`.
- Run Trivy security scans (push only).
- Run integration tests with docker-compose.

## [mobile][pr+develop+master] Build ([mobile.yml](mobile.yml))
**Triggers**
- `push` to `master` or `develop` when `apps/mobile/**` changes.
- `pull_request` to `master` or `develop` when `apps/mobile/**` changes.

**Purpose**
- Build Expo dev server and verify Metro status.
- Build Expo Web (Docker) and upload artifacts.
- Build Android/iOS with EAS on `push` (master/develop) only.

## [platform][master] Continuous Monitoring ([monitoring.yml](monitoring.yml))
**Triggers**
- Scheduled: every 6 hours (`0 */6 * * *`).
- `workflow_dispatch`.

**Purpose**
- Production health checks (master branch only).
- Dependency update check and issue creation.
- Docker image size monitoring.
- SSL certificate expiry check.
- Backup verification placeholder.

## [api+web][pr+develop+master] Performance Testing ([performance.yml](performance.yml))
**Triggers**
- `pull_request` (label-gated) when changes touch `apps/api/**`, `apps/web-player/**`, or `apps/web-artists/**`.
- Scheduled weekly (`0 2 * * 1`) for `develop` and `master`.
- `workflow_dispatch`.

**Purpose**
- API load test (Postgres + Redis services, k6).
- Lighthouse CI for `web-player`.
- Bundle analysis for `web-player` (PRs only).
- DB performance prep (migrations/seed).

## [monorepo][pr] Quality Checks ([pull_request.yml](pull_request.yml))
**Triggers**
- `pull_request` on `opened`, `synchronize`, `reopened`.

**Purpose**
- Lint/format/type checks.
- Build & test with services (Postgres/Redis).
- Optional Docker build when PR has label `docker` or title contains `[docker]`.
- PR summary comment.

## [monorepo][develop+master] Security Checks ([security.yml](security.yml))
**Triggers**
- `push` to `master` or `develop`.
- Scheduled weekly (`0 0 * * 0`) for `develop` and `master`.
- `workflow_dispatch`.

**Purpose**
- `pnpm audit` (non-blocking).
- Secret scanning (TruffleHog, non-blocking).
- CodeQL analysis.
