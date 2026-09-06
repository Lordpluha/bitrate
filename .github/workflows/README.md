# CI/CD Workflows

Current workflow map for .github/workflows.

## Core Principles
- Workflows are organized by domain with one entry workflow per domain.
- Entry workflows stay thin (triggers + routing), while reusable workflows contain implementation logic.
- Complex domains are split into orchestration reusable workflows and smaller atomic reusable blocks.
- Shared setup logic is reused via composite actions:
  - .github/actions/setup-node-pnpm
  - .github/actions/setup-docker

### Security conventions

- **`permissions:` is always explicit**, never left to the repository default. The release and
  deploy workflows declare `permissions: {}` at workflow level and let each job ask for exactly what
  it needs. No job in this repository holds `actions: write`.
- **No `${{ }}` inside a `run:` block** in the release or deploy chain. Values arrive through
  `env:` and are read as `"$VAR"`, so nothing can be spliced into a shell word. (Some older
  monitoring, mobile and desktop reusables still interpolate workflow-authored inputs directly;
  none of them read attacker-controlled context, but new code should not copy the pattern.)
- **Third-party actions in the release and deploy chain are pinned by full commit SHA** with a
  `# vX.Y.Z` comment. Elsewhere in the repository a major tag is still used.
- **No secret is ever interpolated into a `run:` string, a step `name`, an artifact or a cache
  key.** Secrets travel through `env:`.

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

Four workflows, and one claim holds the whole thing together: **a human merging the release pull
request is what starts the build and the deploy.** A merge performed on github.com is authenticated
as that person, so the push to `master` it produces raises a push event and creates workflow runs
normally — which a `GITHUB_TOKEN` push does not. See
[ADR-0029](../../apps/docs/docs/architecture/0029-release-pr-merged-by-a-human.md); operator
procedures live in
[apps/docs → Deployment § 7](../../apps/docs/docs/infrastructure/deployment.md#7-releasing).

- release.yml / release_reusable.yml — **the cut**. `workflow_dispatch` with a `dry_run` input.
  Derives the product version, creates `release/v<x.y.z>`, merges `master` into it, runs
  `changeset version`, lands one **signed** commit, runs the layer-1 gates, opens the pull request.
- release_publish.yml / release_publish_reusable.yml — **the publish**. `on: push: branches:
  [master]`. Tag, GitHub Release, five images, deploy, back-merge pull request — five `needs:`-
  ordered jobs of one run.
- release_images.yml / release_images_reusable.yml — **image rebuilds** for a version tag.
  `on: push: tags: ['v*']` plus `workflow_dispatch`.

```
human runs [release] Cut Release PR  (workflow_dispatch)
   |
   |  derive v<x.y.z> from the AUTHORED changesets
   |  create release/v<x.y.z>, POST /merges master into it   <- signed
   |  changeset version + product version into root package.json
   |  createCommitOnBranch                                   <- signed, ONE commit
   |  gates: install --frozen-lockfile, lint, check-types, build
   |  statuses: bitrate/release-version, bitrate/release-gates
   |  gh pr create --base master
   v
human approves and merges the pull request
   |
   v  push event on master, authored by that human
   |
   |  release_publish.yml
   |    1. resolve          root package.json version; stop if v<version> is already a tag
   |    2. tag-and-release  annotated tag + GitHub Release, notes diffed from the previous v* tag
   |    3. images           five images at :v<x.y.z>, :<sha>, :master
   |    4. deploy           production environment approval, then the server
   |    5. back-merge       PR backmerge/v<x.y.z> -> develop  (needs 2, NOT 4)
   v
human merges the back-merge PR, and develop carries the bumps again
```

#### Seven things that are easy to break

- **Nothing in this chain may use `git commit`.** `master` and `develop` both have
  `required_signatures: true`. A commit made on a runner is unsigned, pushing it to `release/*`
  succeeds, and the merge into `master` is then refused with `Commits must have verified
  signatures`. The version commit is created with GraphQL `createCommitOnBranch` and the branch
  merge with `POST /repos/{owner}/{repo}/merges`, both of which GitHub signs with its own key. Both
  were measured: `verified: true, reason: valid`, against `git commit`'s `verified: false, reason:
  unsigned`. Squash-merging happens to launder an unsigned commit, which is exactly why relying on
  it is wrong — it breaks the day someone picks "Create a merge commit".
- **The release pull request is opened by the workflow, so no `pull_request` workflow runs on it.**
  That is Route B, and it is forced: `master` requires one approving review and GitHub forbids
  approving your own pull request, so a human-opened release PR would need an admin bypass every
  time. The two commit statuses are the gate that replaces the suites, and they have to be
  registered as required checks by an admin — `pnpm check:branch-protection --apply`. `GITHUB_TOKEN`
  cannot do it (no `administration` scope) and the UI cannot either (its picker only offers checks
  seen in the last seven days).
- **The version is derived from `.changesets[].releases[].type`, never `.releases[].type`.** The
  first is what a human wrote; the second is Changesets' resolved plan and includes the patch bumps
  it generates for *dependents*, so deriving from it would let a change inflate the product version
  by travelling along a dependency edge. At the v1.0.0 cut the authored set was 33 major /
  34 minor / 59 patch across 74 changesets, while the resolved plan was 13 x major -- which is
  what the distinction costs when it is got wrong.
- **A release rebuilds all five services, path filters and all.** `infra/docker-compose.prod.yaml`
  pulls every service at one shared `${IMAGE_TAG}`, so a service that skipped its build would have
  no image under the version tag and `compose pull` would fail on it. That is why
  `release_images_reusable.yml` exists at all rather than a tag trigger on the five per-app
  workflows: GitHub ANDs `on: push: paths:` with `on: push: tags:` inside one `push` block, so a tag
  trigger there would be path-filtered.
- **The tag the publish run creates raises no `push: tags` event**, because it is created with
  `GITHUB_TOKEN`. That is why the images and the deploy are `needs:` jobs of that run rather than
  workflows woken by the tag. `release_images.yml`'s and `deploy.yml`'s tag triggers are alive for a
  *human-pushed* tag — a rebuild and a rollback.
- **The back-merge's head is `backmerge/v<x.y.z>`, not `master`.** `develop` has
  `require_last_push_approval`, and the last push to `master` was the release merge — by the very
  person who then has to approve the back-merge. A bot-created branch makes the bot the last pusher.
- **A push to `master` carrying no release does nothing.** `resolve` reads the root
  `package.json` version and stops if `v<version>` is already a tag. No workflow pattern-matches a
  commit subject any more; the previous design answered the same question in seven `if:` conditions.

**Nothing publishes to npm.** Every workspace is `"private": true` and `.changeset/config.json`
sets `access: "restricted"`. The output of a release is version numbers, changelogs, tags, a GitHub
Release and five images — there is no publish step missing.

`privatePackages.tag` in `.changeset/config.json` is what makes the per-workspace tags exist at all.
Changesets defaults it to `false`, and with every workspace private that made `changeset tag` a
silent no-op; the repository had exactly one tag after seventy changesets had accumulated.

#### Tags

| Tag | Mutability | Use |
|---|---|---|
| `:master` | **moves** with every release | convenience pointer at the current release; **never** a rollback target |
| `:<sha>` | immutable | tracing an image back to a commit |
| `:v<x.y.z>` | immutable | what `IMAGE_TAG` is pinned to; **the** rollback handle |

`release_images.yml` deliberately does **not** republish `:master`, so rebuilding an older release
cannot drag the moving pointer backwards.

Semantic versions do not sort as text. Every listing uses a version sort:
`git tag -l 'v*' --sort=-v:refname`, never `--sort=-refname`, which puts `v1.10.0` before `v1.9.0`.

### Deploy (production)
- deploy.yml — production deploy entry workflow. `on: push: tags: ['v*']` **plus**
  `workflow_dispatch` with a `full` / `redeploy` / `health-only` mode and an `image-tag` input.
- deploy_reusable.yml — optionally waits for this ref's images, renders the server's `.env` from
  the deploy environment's secrets and variables (including `IMAGE_TAG`), pushes `infra/`
  and `Taskfile.yml`, runs `task prod:deploy` and `task prod:migrate`, then probes the
  public endpoints.

Seven things about it are easy to get wrong:

- **There is no push-to-master trigger, and that is not a loosened gate.** It used to run on every
  push to `master` and guess which push was a release by matching the commit subject. That path only
  ever fired when a PAT wrote the version commit. On the release path the deploy is now a `needs:`
  job of `release_publish.yml`; the tag trigger covers a hand-pushed tag and a rollback.
- **On a tag push there is no `inputs` context**, so every `inputs.*` reference in `deploy.yml`
  reads as an empty string. `wait-for-images` and `run-deploy` therefore name the push case
  explicitly (`github.event_name == 'push' || ...`); a bare `inputs.mode == 'full'` would evaluate
  false on a tag push and silently skip the wait for that tag's images.
- **`IMAGE_TAG` is rendered into the server's `.env` on every deploy.** Precedence: the
  `image-tag` input, then this run's own tag name when at a tag, then `master`.
  It is one value for the whole stack because the compose file has one `${IMAGE_TAG}`.
  A rollback is therefore a run at an older version tag and nothing else — including
  `infra/`, the nginx templates and the Taskfile, which are checked out from that tag too.
- **The ref must be `master` or a `v*` tag that is an ancestor of `origin/master`.** The ancestry
  check is why the deploy's checkout uses `fetch-depth: 0`; without it anyone able to push a tag
  could deploy any tree.
- **The environment is the approval gate.** The deploy job declares
  `environment: ${{ inputs.environment }}`, and `deploy.yml` passes `production`. Until that
  environment exists in repository settings *with a required reviewer*, the job runs
  unattended — declaring it is not itself a gate.
- **Configuration is environment-scoped**, which is why the caller passes `secrets: inherit`. A job
  that calls a reusable workflow may not declare `environment:` — GitHub allows only
  `name`/`uses`/`with`/`secrets`/`needs`/`if`/`permissions`/`strategy`/`concurrency` there. The
  caller therefore has no environment, so an explicit
  `secrets: JWT_SECRET: ${{ secrets.JWT_SECRET }}` mapping would resolve against repository scope
  and pass an empty string. `inherit` defers resolution to the called workflow's `deploy` job, which
  does carry the environment. The trade is that `inherit` exposes every repository secret to
  `deploy_reusable.yml`, not just the eleven the deploy uses.
- **The health job has no environment, on purpose, and so cannot read `vars.DOMAIN`.**
  Protection rules apply per job, so giving it one would create a second pending deployment
  and could leave a deploy approved but never verified. The domain instead travels as a
  `domain` output of the deploy job. That is also why the deploy job runs in *every*
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
| `SENTRY_RELEASE` | `bitrate-api@<version of @bitrate/api>` | Names a released version with a changelog entry and a tag, not an arbitrary SHA. A forward slash is illegal in a Sentry release name, which is why it is not `@bitrate/api@…`. |
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

`workflow_run` was rejected for the image wait and is still rejected: it runs with repository
secrets in a context the caller does not choose, and it would reintroduce exactly the implicit
coupling this chain removed.

### Security
- security.yml — security checks for develop/master (push, schedule, workflow_dispatch).

### Monitoring
- monitoring.yml — release monitoring for develop/master (schedule, push, workflow_dispatch).
- monitoring_reusable.yml — monitoring orchestration reusable workflow.
- monitoring_health_reusable.yml / monitoring_dependency_reusable.yml / monitoring_image_size_reusable.yml / monitoring_ssl_reusable.yml / monitoring_backup_reusable.yml — smaller reusable monitoring blocks.

## Structure Summary
- Entry workflows: api.yml, desktop.yml, docs.yml, mobile.yml, storybook.yml, ui_react.yml, web_player.yml, web_artists.yml, security.yml, monitoring.yml, web-integration-test.yml, release.yml, release_publish.yml, release_images.yml, deploy.yml.
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

Each also gets an immutable `:develop-<sha>` tag. A release build publishes three:
`:master` (moving), `:<sha>` (immutable) and `:v<x.y.z>` (immutable — the rollback handle). The
repository name comes from `github.event.repository.name`, so a fork publishes under its own path.

| Tag | Mutability | Use |
|---|---|---|
| `:develop` | moves | latest develop build |
| `:develop-<sha>` | immutable | pinning a develop artefact |
| `:master` | moves | convenience pointer at the last release; **never** a rollback target |
| `:<sha>` | immutable | tracing an image back to a commit |
| `:v<x.y.z>` | immutable | what `IMAGE_TAG` is pinned to; the rollback handle |

### Build-time configuration is permanent

`next build` inlines every `NEXT_PUBLIC_*` value into the client bundle, so the web-player
and web-artists images are only as correct as the build args their reusable workflow passes.
Those live in one `env:` block per reusable workflow (`BUILD_*`), default to the real
production origins, and accept a `vars.*` override for forks and staging. Changing them
requires rebuilding the image — a server-side environment variable cannot correct a value
that is already in the bundle.

api, docs, and storybook take no environment-specific build args and are the same image in
every environment.
