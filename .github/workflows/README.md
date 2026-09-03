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

### Web Player
- web_player.yml — Web Player pipeline entry workflow.
- web_player_reusable.yml — Biome, typecheck, Vitest, Playwright E2E, and Docker build.

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
- ui_react.yml — UI React test entry workflow.
- ui_react_reusable.yml — Biome plus unit, integration, snapshot, and Chromium screenshot
  projects.

### Storybook (ui.bitrate.me)
- storybook.yml — Storybook image entry workflow, path-filtered on packages/ui-react.
- storybook_reusable.yml — builds packages/ui-react/Dockerfile (target: production) and
  publishes it. Split from the ui_react pair so only this workflow needs packages: write,
  and so the ui-react checks are not repeated per image build.

### Docs (docs.bitrate.me)
- docs.yml — Docs pipeline entry workflow.
- docs_reusable.yml — Docusaurus typecheck plus the apps/docs/Dockerfile
  (target: production) image build and publish.

### Integration Tests (Docker Compose)
- web-integration-test.yml — integration tests for PR and push (develop/master) + workflow_dispatch.
- web-integration-test_reusable.yml — reusable integration test scenario.

### Deploy (production)
- deploy.yml — production deploy entry workflow: push to `master` plus `workflow_dispatch`
  with a `full` / `redeploy` / `health-only` mode.
- deploy_reusable.yml — waits for this commit's images, renders the server's `.env` from
  repository secrets and variables, pushes `infra/` and `Taskfile.yml`, runs
  `task prod:deploy` and `task prod:migrate`, then probes the public endpoints.

Three things about it are easy to get wrong:

- **The `production` environment is the approval gate.** The deploy job declares
  `environment: production`. Until that environment exists in repository settings *with a
  required reviewer*, the job runs unattended — declaring it is not itself a gate.
- **Configuration is repository-scoped, not environment-scoped.** The caller job resolves
  `secrets:` before entering the environment, and the health job has no environment at all,
  so environment-scoped secrets and variables would silently be empty. Set them at the
  repository level.
- **The deploy pushes `infra/` and `Taskfile.yml` to the server rather than having the server
  `git fetch`.** Anonymous git traffic from the VPS is throttled intermittently; a failed
  fetch would leave the old compose file and nginx templates in place while newer images
  are pulled, which is exactly the mismatch the step exists to prevent. `.deployed-commit`
  in the server's checkout records which commit is live.

The deploy is triggered by the push itself and its first job polls the image workflows'
runs for that SHA, rather than hanging off `workflow_run`. `workflow_run` cannot express
"wait for whichever subset of the five image workflows this commit's path filters actually
started", and it runs with repository secrets in a context the caller does not choose.

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
- Entry workflows: api.yml, desktop.yml, docs.yml, mobile.yml, storybook.yml, ui_react.yml, web_player.yml, web_artists.yml, security.yml, performance.yml, monitoring.yml, web-integration-test.yml, deploy.yml.
- Reusable workflows: all *_reusable.yml files at the top level of .github/workflows.
- Note: GitHub Actions requires local reusable workflows referenced via uses: ./.github/workflows/... to be stored at the top level of .github/workflows.

## Published images

The five app services in infra/docker-compose.prod.yaml pull from GHCR rather than building
on the VPS. The develop-branch reference for each:

| Service | Image | Built by |
|---|---|---|
| api | `ghcr.io/lordpluha/bitrate/api:develop` | api.yml |
| web-player | `ghcr.io/lordpluha/bitrate/web-player:develop` | web_player.yml |
| web-artists | `ghcr.io/lordpluha/bitrate/web-artists:develop` | web_artists.yml |
| docs | `ghcr.io/lordpluha/bitrate/docs:develop` | docs.yml |
| storybook | `ghcr.io/lordpluha/bitrate/storybook:develop` | storybook.yml |

Each also gets an immutable `:develop-<sha>` tag; master pushes publish `:master` and
`:<sha>`. The repository name comes from `github.event.repository.name`, so a fork publishes
under its own path.

### Build-time configuration is permanent

`next build` inlines every `NEXT_PUBLIC_*` value into the client bundle, so the web-player
and web-artists images are only as correct as the build args their reusable workflow passes.
Those live in one `env:` block per reusable workflow (`BUILD_*`), default to the real
production origins, and accept a `vars.*` override for forks and staging. Changing them
requires rebuilding the image — a server-side environment variable cannot correct a value
that is already in the bundle.

api, docs, and storybook take no environment-specific build args and are the same image in
every environment.
