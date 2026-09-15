# ADR-0030: Remove the performance testing suite

Status: Accepted

Date: 2026-09-05

## Context

The repository carried a performance testing suite made of one k6 workspace and seven GitHub
Actions workflows. It has been in the tree since 2026-01-07 and is being removed without a
replacement. This record exists so that decision is legible later, because the suite is the kind
of thing a future reader would otherwise assume was lost by accident.

### What existed and what each part actually measured

`packages/performance-test` held a single k6 script, `src/load/api-load-test.js`, driving the API
over cookie-based auth at `/api/v1`. It defined three scenarios in one ~22-minute run: **ramp**
(`ramping-vus` to 50 VUs, held, then to 100 VUs, held, then down), **spike** (200 VUs for 90
seconds starting at t=10m), and **soak** (30 constant VUs for 10 minutes starting at t=12m). Its
thresholds were `http_req_duration p(95)<500ms` and `p(99)<1000ms`, `http_req_failed rate<0.05`,
and a custom `errors rate<0.1`.

`performance.yml` triggered on push to `develop`/`master` under app paths, on a weekly cron
(`0 2 * * 1`), and on `workflow_dispatch`. It called `performance_reusable.yml`, which fanned out
to five jobs:

| Job | What it covered | Could it fail on a regression? |
|---|---|---|
| `api-load` | The k6 script above, against a natively-run API with Postgres 16 and Redis 7 service containers | **Yes** — the k6 thresholds were real |
| `lighthouse` | `treosh/lighthouse-ci-action@v10` over `/`, `/browse`, `/search` of a built web-player | No — `uploadArtifacts: false`, `temporaryPublicStorage: true`, no `budgetPath` and no assertions configured |
| `bundle-analysis` | `ANALYZE=true next build`, artifact upload, then `preactjs/compressed-size-action@v2` over `apps/web-player/.next/static/**/*.js` | No — that action reports by commenting on a pull request, and the workflow had no `pull_request` trigger |
| `db-performance` | Postgres + Redis, migrate and seed, `pg_stat_statements`, then `pnpm run test:e2e:performance`, then a top-10 slowest-query `SELECT` printed to the log | No — see below |
| `docker-performance` | The full `docker-compose.preprod.yaml` stack with k6 run against it | No — its k6 step carried `continue-on-error: true` |

So of five jobs, exactly **one** — `api-load` — could turn red because performance got worse. The
other four produced artifacts, log output, or nothing.

Two of them were emptier than they looked. `db-performance`'s central step ran
`jest --config ./test/jest-e2e.json -t performance --passWithNoTests`; no `describe` or `it` in
`apps/api/test` contains the string "performance", so that step matched zero tests and exited 0 on
every run. `docker-performance` was gated to `schedule`/`workflow_dispatch` only, and its
`continue-on-error: true` was deliberate and documented in the file: the preprod compose stack does
not pass `API_RATE_LIMIT_MAX` or `JWT_ACCESS_EXPIRES_IN` to the `api` service, so the global
`ThrottlerGuard` (100 req/min per IP) dominated the measurement and its thresholds were not
meaningfully applicable.

### Why it goes now

**It failed far more often than it passed.** Across the 68 runs GitHub still retains, from
2026-06-18 to 2026-09-05: **60 failures, 7 successes, 1 cancelled** — an 88% failure rate.

**Every scheduled run failed.** All **11 of 11** weekly cron runs, from 2026-06-22 through
2026-08-31, ended in failure. The schedule was the only trigger under which
`docker-performance` was ever eligible to run, so the one job that exercised the containerised
stack has no green run in the retained history.

**It never ran on a pull request.** Of the 68 runs, 57 were `push` and 11 were `schedule`; **zero**
were `pull_request`. Both jobs designed to report into a PR — `bundle-analysis`'s size comparison
and `api-load`'s results comment — therefore never surfaced anything. The comment step in
`performance_api_load_reusable.yml` was already annotated in-file as unreachable for this reason.

**When it did fail, it was rarely about performance.** Sampling per-job results across the 12 most
recent runs: `lighthouse` 12/12 green, `bundle-analysis` 12/12 green, `db-performance` 10 green /
2 red, `api-load` 3 green / 9 red, `docker-performance` skipped 12/12. The most recent failure
(run 33978197177, 2026-09-05) failed in `api-load` and `db-performance` at the same step —
**"Setup database"**, a Prisma migrate/seed failure. That is a broken fixture, not a latency
regression.

**It absorbed continuous repair.** 50 commits have touched the seven workflows or the k6
workspace, **37 of them `fix` commits**. The most recent, `d262bcfc`, stopped the load test
measuring the rate limiter and an expired access token rather than the API — meaning that until
2026-09-05 the one job with real thresholds was substantially measuring its own harness.

One claim that motivated this removal did **not** survive checking, and is recorded here so it is
not repeated. `performance_lighthouse_reusable.yml:45` pinned `treosh/lighthouse-ci-action@v10`,
whose runner `actionlint` 1.7.12 flags as too old for GitHub Actions — the single actionlint
finding in the entire repository. That is a latent break, but it had not broken yet: the
`lighthouse` job was green on all 12 sampled runs. Its real defect was the one in the table above
— it asserted nothing.

**There is no traffic to regress against.** Bitrate has not deployed to production
([ADR-0027](0027-deploy-by-pulling-ci-images.md) describes the delivery path being built now).
A p95 threshold on a seeded database on a shared GitHub runner is not a measurement of anything a
user will experience, and nobody was reading the artifacts it produced.

## Decision

Delete the performance testing suite entirely: the `@bitrate/performance-test` workspace and all
seven `performance*.yml` workflows, plus everything that existed only to serve them — the
`test:e2e:performance` script in `apps/api` and the `ci:bundle-analysis-install` script in
`apps/web-player` (each had exactly one consumer, a workflow deleted here), the k6 entries in
`scripts/check-environment.mjs`, the k6 output paths in `.gitignore`, the `CODEOWNERS` entry, and
the prose references across `README.md`, `CLAUDE.md`, `.claude/rules/monorepo.md`,
`.github/workflows/README.md`, and the docs architecture page.

`.changeset/bitrate-package-scope.md` listed `'@bitrate/performance-test': major` in its
frontmatter. `changeset version` errors on a changeset naming a package that does not exist, so
that line is removed in the same commit; the other twelve workspaces it names are untouched.

Performance work itself is not banned. What is removed is the automated suite and the claim, made
by a green check, that performance was being watched.

## Consequences

- **No automated regression signal on API latency.** Nothing measures p95/p99 response time, error
  rate under load, or behaviour under a spike or a soak. A change that makes an endpoint ten times
  slower will merge with every check green.
- **No bundle-size gate.** Nothing reports when a dependency or an import adds weight to the web
  player's JavaScript. In practice this changes little — the comparison only ever ran on `push`,
  where it had no PR to comment on — but the capability is gone rather than dormant.
- **No Lighthouse scores.** No LCP, CLS, or accessibility-score trend for `/`, `/browse`, or
  `/search`. Again, nothing was asserting on them, but the numbers were at least being produced.
- **No slow-query report.** The weekly `pg_stat_statements` top-10 dump is gone.
- **CI gets faster, cheaper, and quieter.** A ~22-minute k6 run plus four other jobs no longer run
  on every push touching `apps/api`, `apps/web-player`, or `apps/web-artists`, and the weekly cron
  no longer produces a failure notification that is 11-for-11 noise.
- **`actionlint` is clean.** The repository's only actionlint finding lived in a deleted file.
- **The remaining red on `develop` is real.** This is the substantive benefit: a permanently
  failing check trains everyone to ignore failing checks.

These losses are stated plainly and are not offset by anything added here. The project is
choosing to have no performance signal rather than a signal it does not trust.

## Bringing it back

The suite exists in full at **`cb4b7c0e`**, the parent of the commit that removes it. It can be
read or restored without reconstructing it from memory:

```bash
git show cb4b7c0e:packages/performance-test/src/load/api-load-test.js
git show cb4b7c0e:.github/workflows/performance_api_load_reusable.yml
git checkout cb4b7c0e -- packages/performance-test .github/workflows/performance.yml
```

Restoring it wholesale would restore its defects too. Anything brought back should run on
`pull_request` so its comparisons have somewhere to report, and should assert rather than merely
produce artifacts.

Concrete conditions that would justify rebuilding it — recognisable when they happen, rather than
a vague "when we're bigger":

- **Real production traffic exists**, so a load profile can be modelled on observed usage instead
  of guessed VU counts.
- **A performance incident occurs** — a user-visible slowdown, a timeout in production, an OOM
  under load. Then the regression test is written against a known failure, which is the only way
  a threshold gets a defensible number.
- **A paying-user SLA or a contractual latency commitment exists.** At that point the measurement
  is a requirement rather than a nicety.
- **The audio delivery path changes materially** — [ADR-0020](0020-cmaf-range-mse-playback.md)'s
  CMAF/Range/MSE playback is latency-sensitive in a way the rest of the API is not, and is the
  most likely first thing to deserve a dedicated benchmark.

## Alternatives considered

- **Keep it, but disable the schedule** — rejected. It would stop the 11-for-11 weekly failure
  notifications, but `push` was 57 of the 68 runs, so most of the noise and all of the maintenance
  would remain. It also leaves the suite looking maintained while nobody looks at it, which is the
  state that produced a load test measuring its own rate limiter for months.
- **Keep only the bundle-size check** — the cheapest job and, with `lighthouse`, one of the two
  never observed failing. Rejected because it is not actually functioning: `compressed-size-action`
  reports by commenting on a pull request, and no run in the retained history was a
  `pull_request` event. Keeping it would mean keeping `performance.yml`,
  `performance_reusable.yml`, a reusable workflow, and a workspace script to preserve a check that
  has never reported anything. If bundle size later deserves a gate, it belongs in
  `web_player.yml` on `pull_request`, not in a revived performance suite.
- **Delete only the broken jobs, keep `api-load`** — rejected, though it is the closest call, since
  `api-load` is the one job with real thresholds. It is also the job with the worst record (9 of 12
  red) and the highest cost (~22 minutes per run plus Postgres and Redis service containers), and
  the thresholds it enforces — p95 < 500ms against a seeded database on a shared runner — are
  guesses that no observed traffic informs. Keeping the only expensive, flaky, unvalidated job is
  the worst subset to keep.
- **Fix everything and keep the suite** — rejected as the wrong investment now. Fixing it means
  adding a `pull_request` trigger, configuring Lighthouse assertions and budgets, writing the
  `apps/api` performance tests that `-t performance` has always failed to match, plumbing
  `API_RATE_LIMIT_MAX` and `JWT_ACCESS_EXPIRES_IN` into the preprod compose stack, and repinning
  the Lighthouse action. That is real work whose output is a set of thresholds with no traffic to
  calibrate against.
