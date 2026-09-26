# ADR-0046: Loki log aggregation, added to the ADR-0044 observability stack

Status: Accepted

Date: 2026-09-24

## Context

ADR-0044 gave the preprod-only observability stack metrics (Prometheus + Grafana) but no logs
— today, `apps/api` logs plain text via `@nestjs/common`'s built-in `Logger` to the container's
stdout, retrievable only via `docker logs` while the container is alive. The developer asked to
extend the same stack with log aggregation via Grafana Loki.

A short grill-me interview (`mattpocock-skills:grilling`) settled the shape of this before
implementation:

- **Scope**: only `api` and `nginx` — `postgres`/`redis`'s own verbose logs and the web
  frontends were judged not worth collecting for this pass.
- **Structured logging**: `apps/api` gets `nestjs-pino` (replacing the bare `@nestjs/common`
  `Logger` output with JSON), with automatic per-request logging enabled (the main reason to
  add it — request-level correlation nginx's access log alone cannot give, since nginx never
  sees an internal exception) but `GET /api/v1/metrics` excluded (Prometheus scrapes it every
  15s; left in, it alone would produce ~5,760 log lines/day of pure noise).
- **Retention**: 7 days (shorter than Prometheus's 15d, an explicit, separate choice).
- **Compose profile**: same `observability` profile as ADR-0044, not a new one.
- **Dashboard**: none vendored — Grafana's built-in **Explore** view only, since log-browsing
  is inherently ad-hoc (chasing one specific error), not a steady-state panel.
- **Shipping mechanism**: the interview settled on **Promtail** by name, reading Docker's
  container logs.

That last point changed during implementation, not before it: checking current Grafana docs
(not done before the interview closed) found that **Promtail is deprecated as of Loki 3.0 and
was removed upstream as of Loki 3.7.3** — Grafana's own currently-maintained agent for this job
is **Alloy**. Separately, the interview's "filesystem storage, BoltDB-shipper index" default
(matching ADR-0044's own reasoning-by-analogy to Prometheus's local storage) turned out to name
a **deprecated index type**, slated for removal in Loki 4.0; the current recommended local index
is **TSDB**. Both corrections are made here, disclosed, rather than silently building on
either a removed agent or a deprecated index because that is what was said in the room.

## Decision

Add two services to `infra/docker-compose.preprod.yaml`'s existing `observability` profile:

| Service | Role |
|---|---|
| `loki` | Log storage. `127.0.0.1`-bound (only `grafana`/`alloy` need to reach it), filesystem-backed (`store: tsdb`, `object_store: filesystem` — no S3/GCS, same spirit as `prometheus_data`), 7-day retention via the compactor. |
| `alloy` | Discovers `bitrate-api` and `bitrate-nginx` via the Docker Engine API (`discovery.docker`, server-side name filter — no other container is even listed), tails their logs (`loki.source.docker`), and ships them to `loki`. Not Promtail — see Context. |

`apps/api` gets `nestjs-pino` (`apps/api/src/infra/observability/logger.config.ts`,
`LoggerModule.forRoot()` wired into `app.module.ts`, `app.useLogger()` in `main.ts`). Existing
`new Logger(context)` call sites across the codebase are unchanged — nestjs-pino's own
migration guidance is to keep using `@nestjs/common`'s `Logger` at call sites and only replace
the app-wide logger via `app.useLogger()`, which is what routes their output through pino.
`/api/v1/metrics` is excluded from auto-request-logging via `pino-http`'s `autoLogging.ignore`,
matched on the raw `req.url` — nestjs-pino's own `exclude` option (a thin wrapper on Nest's
`MiddlewareConsumer.exclude()`) was tried first and did not correctly exclude the route once
this app's real global prefix (`api`) and URI versioning (`v1`) were both in effect, confirmed
by a failing integration test before the `req.url`-based approach was tried and confirmed
passing (`apps/api/src/infra/observability/logger.config.int-spec.ts`). Sensitive headers
(`authorization`, `cookie`, response `set-cookie`) are redacted via pino's own `redact` option.

`nginx`'s access/error logs need no changes — the official `nginx:alpine` image already
symlinks both to `/dev/stdout`/`/dev/stderr`, so Alloy's Docker-log collection sees them the
same way it sees `api`'s.

A `loki` Grafana datasource is provisioned (`grafana/provisioning/datasources/loki.yml`); no
dashboard is vendored for it, per the interview's Explore-only decision.

## Consequences

- **Easier**: `api`/`nginx` logs are searchable and correlatable with metrics in the same
  Grafana instance, retained for 7 days past container restarts, without needing a live
  `docker logs` session.
- **Harder / explicitly out of scope**: `postgres`/`redis` and the web frontends are not
  collected — extending scope to them is a future decision, not assumed here. `nginx` itself
  only runs under a separate `production` Compose profile (pre-existing, unrelated to this
  ADR) — its logs only reach Loki on days it happens to be running; `task observability:up`
  does not start it.
- **Mandatory**: `nestjs-pino`'s automatic request logging is a real, if small, behavioral
  change to `apps/api`'s log output shape (JSON instead of plain text) — this affects
  production too, since `apps/api` is a shared codebase; the route/auth/response of every
  existing endpoint is unchanged, only the log lines produced alongside them.
- The Promtail → Alloy and BoltDB-shipper → TSDB corrections mean this ADR's "Decision" does
  not match what was verbally agreed mid-interview — recorded here specifically so a future
  reader is not confused finding `alloy`/`tsdb` in the compose file after a design
  conversation that said "Promtail"/"BoltDB-shipper".

## Alternatives considered

- **Promtail.** Named during the interview; rejected once implementation-time research found it
  deprecated (Loki 3.0) and removed upstream (Loki 3.7.3). See Context.
- **BoltDB-shipper index.** Same situation — deprecated, being removed in Loki 4.0; TSDB is the
  current recommended local index and has been since Loki 2.8.
- **Direct app→Loki shipping (`pino-loki` transport), bypassing Docker log collection.**
  Rejected: only covers `api`; `nginx` needs a container-log-based mechanism regardless, so one
  mechanism (Alloy) covering both is simpler than running two.
- **Vendored community Loki "logs overview" dashboard.** Rejected — Explore already covers
  ad-hoc log queries for a low-traffic dev API; see Context's interview summary.
- **Extend collection to `postgres`/`redis`/the web frontends now.** Rejected for this pass —
  judged low-value without a specific verbosity/filtering plan; can be revisited later.
