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

### Release (changesets)
- release.yml — release entry workflow: push to `master` plus `workflow_dispatch`.
- release_reusable.yml — consumes `.changeset/*.md`, bumps every changed workspace, writes
  its `CHANGELOG.md`, commits `chore(release): version packages` back to `master`, and
  pushes one git tag per bumped workspace.

**Nothing publishes to npm.** Every workspace is `"private": true` and
`.changeset/config.json` sets `access: "restricted"`. The whole output of this workflow is
version numbers, changelogs, and tags — there is no publish step missing.

`privatePackages.tag` in `.changeset/config.json` is what makes the tags exist at all.
Changesets defaults it to `false`, and with every workspace private that made
`changeset tag` a silent no-op; the repository had exactly one tag after seventy
changesets had accumulated.

#### The release chain

```
human merges develop -> master
   |
   v  release.yml  — versions, commits, tags. Deploys nothing.
   |
   v  the version commit is a normal push to master
   |
   +--> api.yml / web_player.yml / web_artists.yml / docs.yml / storybook.yml
   |      build only the workspaces whose paths the version commit touched
   |
   +--> deploy.yml — waits for those images, then stops at the production gate
          |
          v  one human presses Approve
```

Four things hold this together, and each is easy to break by accident:

- **The commit subject `chore(release): version packages` is a protocol string.** It is
  written in `release_reusable.yml` and read by seven `if:` conditions: `release.yml`'s loop
  guard, the five image workflows' `-master` jobs, and `deploy.yml`'s `production` job.
  Change the wording in one place and the chain stops silently. It is matched with
  `startsWith(github.event.head_commit.message, ...)` inside `if:` expressions only — never
  interpolated into a `run:` body.
- **`RELEASE_TOKEN` is what makes the chain start.** GitHub deliberately does not create
  workflow runs for a `push` authenticated with `GITHUB_TOKEN`, so without this repository
  secret the version commit lands on `master` and *nothing downstream fires*. The release
  workflow still versions, commits, and tags — and says loudly in its summary that no build
  and no deploy started, plus how to run them by hand. It needs a fine-grained personal
  access token scoped to this repository with **Contents: Read and write** and nothing else,
  and its owner must be allowed to push to `master` if a ruleset requires pull requests there.
- **A merge with no changesets produces no version commit, no image build, and no deploy.**
  That is the designed behaviour, not a bug: nothing user-visible changed. An
  infrastructure-only or docs-only merge therefore never reaches the server on its own. The
  escape hatch is `workflow_dispatch`: dispatch the image workflows for `master` if the
  commit needs new images, then run `[platform] Deploy Production` with mode `full`
  (or `redeploy` to skip the image wait entirely).
- **A release does not rebuild every service.** The image workflows keep their path filters,
  and a version commit only touches `package.json` and `CHANGELOG.md` for workspaces that
  actually changed. A service with no changeset in a release gets no run and keeps its
  existing `:master` image, which is correct — `await-images` treats "no run for this SHA"
  as exactly that. When *no* image workflow ran for the commit, the deploy warns rather than
  failing, because that is legitimate for a release that only bumped a package no image
  watches.

There is deliberately **no `:<version>` image tag**. Versions here are per-workspace, so
there is no single release version an image could carry, and a service that legitimately did
not rebuild could not satisfy one — a tag that some service can never have is worse than no
tag. `:<sha>` already provides the immutable handle a rollback needs.

### Deploy (production)
- deploy.yml — production deploy entry workflow: the `chore(release): version packages` push
  to `master`, plus `workflow_dispatch` with a `full` / `redeploy` / `health-only` mode.
- deploy_reusable.yml — waits for this commit's images, renders the server's `.env` from
  the deploy environment's secrets and variables, pushes `infra/` and `Taskfile.yml`, runs
  `task prod:deploy` and `task prod:migrate`, then probes the public endpoints.

Four things about it are easy to get wrong:

- **The environment is the approval gate.** The deploy job declares
  `environment: ${{ inputs.environment }}`, and `deploy.yml` passes `production`. Until that
  environment exists in repository settings *with a required reviewer*, the job runs
  unattended — declaring it is not itself a gate.
- **Configuration is environment-scoped.** Every application secret and variable belongs to
  the `production` environment, not to repository scope, so a future `staging` can carry the
  same names with different values. Only `GITHUB_TOKEN` usage is repository-wide.
- **That scoping is why the caller passes `secrets: inherit`.** A job that calls a reusable
  workflow may not declare `environment:` — GitHub allows only
  `name`/`uses`/`with`/`secrets`/`needs`/`if`/`permissions`/`strategy`/`concurrency` there.
  The caller therefore has no environment, so an explicit `secrets: JWT_SECRET: ${{ secrets.JWT_SECRET }}`
  mapping would resolve against repository scope and pass an empty string. `inherit` defers
  resolution to the called workflow's `deploy` job, which does carry the environment. The
  trade is that `inherit` exposes every repository secret to `deploy_reusable.yml`, not just
  the eleven the deploy uses.
- **The health job has no environment, on purpose, and so cannot read `vars.DOMAIN`.**
  Protection rules apply per job, so giving it one would create a second pending deployment
  and could leave a deploy approved but never verified. The domain instead travels as a
  `domain` output of the deploy job. That is also why the deploy job now runs in *every*
  mode — including `health-only` — with `inputs.run-deploy` gating its individual
  server-touching steps rather than the job: it is the only place environment-scoped config
  resolves.
- **The deploy pushes `infra/` and `Taskfile.yml` to the server rather than having the server
  `git fetch`.** Anonymous git traffic from the VPS is throttled intermittently; a failed
  fetch would leave the old compose file and nginx templates in place while newer images
  are pulled, which is exactly the mismatch the step exists to prevent. `.deployed-commit`
  in the server's checkout records which commit is live.

#### Sentry attribution

The deploy renders two extra names into the server's `.env`:

| Name | Value | Why |
|---|---|---|
| `SENTRY_RELEASE` | `bitrate-api@<version of @bitrate/api>` | The deploy only auto-runs on a version commit, so this names a released version with a changelog entry and a tag — not an arbitrary SHA. A forward slash is illegal in a Sentry release name, which is why it is not `@bitrate/api@…`. |
| `SENTRY_ENVIRONMENT` | the `environment` input, i.e. `production` | Labels events by deploy target without depending on `NODE_ENV` being set correctly, and gives a future `staging` correct labels for free. |

**Both are inert until `infra/docker-compose.prod.yaml` lists them in the `api` service's
`environment:` block.** Compose passes through only the names that list carries; writing
them into `.env` first is harmless and makes that a one-line change.

Publishing the release to Sentry — the deploy marker, commit association, and a place to
attach source maps — is separate and currently **off**. It needs a `SENTRY_AUTH_TOKEN`
secret plus `SENTRY_ORG` and `SENTRY_PROJECT` variables on the `production` environment.
A probe step checks all three and the publish step is skipped when any is missing; it never
fails, because by that point production is already live and a red run would suggest a
rollback is needed. `set_commits` is `skip` on purpose: `auto` needs the Sentry GitHub
integration or a full git history and fails the step when it has neither.

Source maps are **not** uploaded. `apps/api/tsconfig.json` sets `sourceMap: true`, so the
maps exist inside the image, but the deploy runner has a checkout and no build output. That
upload belongs in `api_reusable.yml` alongside the Docker build, which would mean extracting
`dist/**/*.map` from the built image — a separate change, and one worth making only after the
auth token exists.

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
- Entry workflows: api.yml, desktop.yml, docs.yml, mobile.yml, storybook.yml, ui_react.yml, web_player.yml, web_artists.yml, security.yml, performance.yml, monitoring.yml, web-integration-test.yml, release.yml, deploy.yml.
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
