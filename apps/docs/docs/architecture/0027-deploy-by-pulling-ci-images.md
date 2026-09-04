# ADR-0027: Deploy by pulling CI-built images, with configuration held in GitHub

Status: Accepted

Date: 2026-09-03

## Context

Production was deployed by building on the server. A single VPS spent twenty-odd minutes per
release compiling five applications, and the build competed with the running stack for the same
CPU and memory. Worse, the artifact was never reviewed anywhere: what shipped was whatever that
machine happened to produce from whatever the checkout happened to contain.

CI already published images to GHCR, so the obvious move was to pull them. That turned out to be
unsafe as it stood, and the reason is the interesting part. Every published frontend image was
built against `http://localhost:3000`, because the workflows read their build arguments from
repository variables with a fallback, and the repository had no variables at all. `NEXT_PUBLIC_*`
values are compiled into the bundle, so no amount of server-side configuration could correct such
an image. Switching the compose file to `image:` without noticing would have replaced a slow deploy
with a broken site.

The server's own configuration was equally invisible. Ten variables the API expects were absent
from the compose file's `environment` list — verified missing on the running container — so six of
them silently used schema defaults and neither OAuth provider could work in production regardless
of what `.env` held. A value edited on the server did nothing, and nothing said so.

## Decision

**Images are built once by CI and pulled.** Each app service names
`ghcr.io/lordpluha/bitrate/<service>:master` alongside its build context. `task prod:deploy` runs
`pull` then `up -d --no-build`; `--no-build` is the load-bearing part, because compose otherwise
falls back to building any image it cannot pull and the fast path silently becomes the slow one.

**Production tracks `master`.** `develop` is the working branch; the released state is what branch
protection and the pull-request flow already treat as such.

**Configuration lives in GitHub, and the server's `.env` is a rendered artifact.** Genuinely secret
values are repository secrets; hosts, ports, lifetimes, cookie names and both OAuth client ids are
repository variables. `NEXT_PUBLIC_*` are variables on purpose — they are compiled into a bundle any
visitor can read, so storing them as secrets protects nothing and only makes them harder to change.
Both must be repository-scoped: the calling job resolves `secrets:` before entering the environment,
and the health job has no environment, so environment-scoped values would resolve to empty strings
without an error.

**A push to `master` deploys, behind a required reviewer.** The workflow waits for that commit's
image builds, then stops at the `production` environment. `environment: production` is not itself a
gate — it does nothing until someone adds a required reviewer.

**The workflow copies `infra/` and `Taskfile.yml` from the runner rather than having the server
fetch.** Those files are read from the working tree, not from any image, so they must match the
commit the images were built from. The server's unauthenticated `git` access to GitHub is throttled
intermittently — observed failing with a credentials prompt and then succeeding five times in a row
minutes later — and a fetch that fails leaves precisely the mismatch the step exists to prevent.

## Consequences

- A deploy is a pull and a restart. The dependency layer changes only with the lockfile, so an
  ordinary release moves only small application layers.
- Editing `.env` on the server lasts until the next deploy overwrites it. The repository is the
  place to change production configuration.
- A missing secret fails the deploy before the server is touched, listing names and never values.
- A compose `--env-file` is not a shell file: `${...}` is interpolated and ` #` starts a comment,
  so a credential containing `$` or ` #` is corrupted rather than rejected. The preflight fails by
  name on those characters; such a credential must be regenerated, not escaped.
- The images and their build caches are readable from GHCR without authentication. That is intended
  for the application images and pointless for `cache/*`, which exports intermediate build stages —
  anything that reaches a build context reaches the cache too. This is why `.dockerignore`
  correctness is a security property here and not merely a build-speed one.

## Alternatives considered

- **Keep building on the server.** Simple and dependency-free, but it spends twenty minutes of a
  production machine's capacity per release and ships an artifact nobody reviewed.
- **Trigger the deploy from `workflow_run` after the image workflows.** It cannot express "wait for
  whichever subset of the five image workflows this commit's path filters actually started", and it
  runs with repository secrets in a context the caller does not choose. The deploy starts on the
  push instead and polls for that commit's runs, which also puts the wait before the approval.
- **Store the whole `.env` as one secret.** Fewer moving parts and impossible to miss a variable,
  but rotating one value means re-pasting all of them, and it would put non-secret configuration —
  including values already public in a client bundle — behind a write-only interface.
- **Deploy unattended on every push to `master`.** Rejected in favour of a required reviewer: the
  same push both builds the images and releases them, so nothing else would stand between a merge
  and production.
