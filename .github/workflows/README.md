# CI/CD Workflows

Current workflow map for .github/workflows.

## Core Principles
- CI/CD is split by domain: pr, develop, master.
- App-specific pipelines follow this pattern: <app>_pr.yml, <app>_develop.yml, <app>_master.yml.
- Cross-domain and infrastructure checks are separated into dedicated workflows (security.yml, performance.yml, monitoring.yml, web-integration-test.yml).
- Shared setup logic is reused via composite actions:
  - .github/actions/setup-node-pnpm
  - .github/actions/setup-docker

## Workflow Quick Review

### API
- api_pr.yml — API checks for pull requests (Docker build + tests).
- api_develop.yml — build/push + tests for develop.
- api_master.yml — build/push for master.

### Admin
- admin_pr.yml — Admin Docker build for pull requests.
- admin_develop.yml — Admin build/push for develop.
- admin_master.yml — Admin build/push for master.

### Web Player
- web_player_pr.yml — Docker build + Biome check for pull requests.
- web_player_develop.yml — build/push + Biome check for develop.
- web_player_master.yml — build/push for master.

### Web Artists
- web_artists_pr.yml — Docker build + Biome check for pull requests.
- web_artists_develop.yml — build/push + Biome check for develop.
- web_artists_master.yml — build/push for master.

### Mobile
- mobile_pr.yml — pull request checks (Expo dev server, web build, manual EAS jobs).
- mobile_develop.yml — develop checks + web image push + manual EAS jobs.
- mobile_master.yml — master web build + manual production EAS jobs.

### Desktop
- desktop_pr.yml — desktop checks for pull requests.
- desktop_develop.yml — desktop build/push + UI smoke test for develop.
- desktop_master.yml — desktop build/push + artifact extraction for master.

### UI React / Visual Tests
- ui_react_pr.yml — visual tests for pull requests.
- ui_react_develop.yml — visual tests for develop.
- ui_react_master.yml — visual tests for master.
- loki_reusable.yml — reusable workflow for Loki.

### Integration Tests (Docker Compose)
- web-integration-test.yml — integration tests for PR and push (develop/master) + workflow_dispatch.
- web-integration-test_reusable.yml — reusable integration test scenario.

### Security
- security.yml — security checks for develop/master (push, schedule, workflow_dispatch).

### Performance
- performance.yml — performance checks for develop/master (push, schedule, workflow_dispatch).
- performance_reusable.yml — performance orchestration reusable workflow.
- performance_api_load_reusable.yml / performance_lighthouse_reusable.yml / performance_bundle_reusable.yml / performance_db_reusable.yml / performance_docker_reusable.yml — smaller reusable performance blocks.

### Monitoring
- monitoring.yml — release monitoring for develop/master (schedule, push, workflow_dispatch).
- monitoring_reusable.yml — monitoring orchestration reusable workflow.
- monitoring_health_reusable.yml / monitoring_dependency_reusable.yml / monitoring_image_size_reusable.yml / monitoring_ssl_reusable.yml / monitoring_backup_reusable.yml — smaller reusable monitoring blocks.

## Trigger Model (Short)
- *_pr.yml → pull_request + workflow_dispatch
- *_develop.yml → push to develop + workflow_dispatch (and schedule where needed)
- *_master.yml → push to master + workflow_dispatch (and schedule where needed)