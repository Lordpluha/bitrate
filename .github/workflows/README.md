# CI/CD Workflows

Актуальная карта workflow в `.github/workflows`.

## Основные принципы
- CI/CD разделён по доменам: `pr`, `develop`, `master`.
- Для приложений используются app-specific workflow (`<app>_pr.yml`, `<app>_develop.yml`, `<app>_master.yml`).
- Инфраструктурные и кросс-доменные проверки вынесены отдельно (`security_*`, `performance_*`, `monitoring_*`, `web-integration-test_*`).
- Общие setup-шаги переиспользуются через composite actions:
  - `.github/actions/setup-node-pnpm`
  - `.github/actions/setup-docker`

## Workflow quick review

### API
- `api_pr.yml` — PR проверки API (docker build + tests).
- `api_develop.yml` — develop build/push + tests.
- `api_master.yml` — master build/push.

### Admin
- `admin_pr.yml` — PR docker build admin.
- `admin_develop.yml` — develop build/push admin.
- `admin_master.yml` — master build/push admin.

### Web Player
- `web_player_pr.yml` — PR docker build + biome check.
- `web_player_develop.yml` — develop build/push + biome check.
- `web_player_master.yml` — master build/push.

### Web Artists
- `web_artists_pr.yml` — PR docker build + biome check.
- `web_artists_develop.yml` — develop build/push + biome check.
- `web_artists_master.yml` — master build/push.

### Mobile
- `mobile_pr.yml` — PR проверки (Expo dev server, web build, manual EAS jobs).
- `mobile_develop.yml` — develop проверки + web image push + manual EAS jobs.
- `mobile_master.yml` — master web build + manual production EAS jobs.

### Desktop
- `desktop_pr.yml` — PR desktop checks.
- `desktop_develop.yml` — develop desktop build/push + UI smoke test.
- `desktop_master.yml` — master desktop build/push + artifact extraction.

### UI React / Visual Tests
- `ui_react_pr.yml` — PR visual tests.
- `ui_react_develop.yml` — develop visual tests.
- `ui_react_master.yml` — master visual tests.
- `loki_reusable.yml` — reusable workflow для Loki.

### Integration Tests (Docker Compose)
- `web-integration-test_pr.yml` — integration на PR.
- `web-integration-test_develop.yml` — integration на develop push.
- `web-integration-test_master.yml` — integration на master push.

### Security
- `security_develop.yml` — security checks для develop (`push`, `schedule`, `workflow_dispatch`).
- `security_master.yml` — security checks для master (`push`, `workflow_dispatch`).

### Performance
- `performance_develop.yml` — performance checks для develop (`push`, `schedule`, `workflow_dispatch`).
- `performance_master.yml` — performance checks для master (`push`, `workflow_dispatch`).

### Monitoring
- `monitoring_develop.yml` — release monitoring develop (`schedule`, `push`, `workflow_dispatch`).
- `monitoring_master.yml` — release monitoring master (`schedule`, `push`, `workflow_dispatch`).

## Trigger-модель (коротко)
- `*_pr.yml` → `pull_request` + `workflow_dispatch`
- `*_develop.yml` → `push` в `develop` + `workflow_dispatch` (и где нужно `schedule`)
- `*_master.yml` → `push` в `master` + `workflow_dispatch` (и где нужно `schedule`)