# CI/CD Workflows

Current workflow map for .github/workflows.

## Core Principles
- Workflows are organized by domain with one entry workflow per domain.
- Entry workflows stay thin (triggers + routing), while reusable workflows contain implementation logic.
- Complex domains are split into orchestration reusable workflows and smaller atomic reusable blocks.
- Shared setup logic is reused via composite actions:
  - .github/actions/setup-node-pnpm
  - .github/actions/setup-docker

## Workflow Quick Review

### API
- api.yml — API pipeline entry workflow.
- api_reusable.yml — reusable implementation for API jobs.

### Admin
- admin.yml — Admin pipeline entry workflow.
- admin_reusable.yml — reusable implementation for Admin jobs.

### Web Player
- web_player.yml — Web Player pipeline entry workflow.
- web_player_reusable.yml — reusable implementation for Web Player jobs.

### Web Artists
- web_artists.yml — Web Artists pipeline entry workflow.
- web_artists_reusable.yml — reusable implementation for Web Artists jobs.

### Mobile
- mobile.yml — Mobile pipeline entry workflow.
- mobile_reusable.yml — Mobile orchestration reusable workflow.
- mobile_expo_reusable.yml / mobile_web_reusable.yml / mobile_eas_reusable.yml — smaller reusable Mobile blocks.

### Desktop
- desktop.yml — Desktop pipeline entry workflow.
- desktop_native_reusable.yml / desktop_docker_reusable.yml — reusable Desktop blocks.

### UI React / Visual Tests
- ui_react.yml — UI React visual tests entry workflow.
- ui_react_reusable.yml — reusable orchestration for UI React visual checks.
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

## Structure Summary
- Entry workflows: admin.yml, api.yml, desktop.yml, mobile.yml, ui_react.yml, web_player.yml, web_artists.yml, security.yml, performance.yml, monitoring.yml, web-integration-test.yml.
- Reusable workflows: all *_reusable.yml files at the top level of .github/workflows.
- Note: GitHub Actions requires local reusable workflows referenced via uses: ./.github/workflows/... to be stored at the top level of .github/workflows.