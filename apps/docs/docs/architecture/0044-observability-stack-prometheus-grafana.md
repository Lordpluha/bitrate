# ADR-0044: Prometheus + Grafana observability stack (preprod-only)

Status: Proposed

Date: 2026-09-23

## Context

ADR-0043 proposed surfacing server/API load as a widget in the admin panel. During grill-me
review the developer redirected: no admin-panel integration — a standalone Prometheus +
Grafana stack instead, scoped to `infra/docker-compose.preprod.yaml`, which today only ever
runs on a developer's own machine (never deployed remotely — see `monorepo.md`'s "Recommended
local dev setup"). Nothing here touches `docker-compose.prod.yaml`.

Today: `GET /metrics` (`apps/api/src/app.controller.ts`) exposes a hand-rolled
`MetricsService` (`apps/api/src/infra/observability/metrics.service.ts`) — per-route HTTP
request count and cumulative duration only, no `prom-client`, no process/CPU/memory/event-loop
data. No Prometheus, Grafana, or exporter exists anywhere in `infra/`. `apps/api/src/infra/prisma/prisma.service.ts`
already holds a raw `pg.Pool` (via `@prisma/adapter-pg`), which is how Prisma 7's
driver-adapter architecture works — Prisma 7 has no separate Rust query-engine process, so the
old `$metrics.json()` API ADR-0043 assumed does not apply here.

Two existing precedents this stack follows exactly:

- **Optional-service gating**: `mobile`/`desktop` in `docker-compose.preprod.yaml` are gated
  behind a Compose `profiles:` entry, started only via `task mobile:up`/`desktop:up`
  (`Taskfile.yml`), never by a plain `task dev:up`. `down` ignores `--profile` when removing
  services, so `mobile:down`/`desktop:down` `stop` + `rm -f` the named services instead of
  running `down` — the same caveat applies to whatever teardown task this stack gets.
- **Cloudflare Tunnel for a panel that should not sit behind a public port**:
  `docker-compose.prod.yaml`'s `admin` service is fronted by its own `cloudflared` container
  reading `CLOUDFLARE_TUNNEL_TOKEN`. That token is prod-scoped and cannot be reused here —
  Grafana needs its own tunnel and its own token, created in the developer's own Cloudflare
  Zero Trust account (a manual, account-specific step — this ADR does not and cannot do it;
  implementation ends with a written runbook or `mattpocock-skills:wizard` script for it, not
  a working tunnel).

## Decision

Add every piece below to `infra/docker-compose.preprod.yaml`, gated behind a new
`observability` Compose profile — `task dev:up` and everything else remains unaffected unless
`task observability:up` is run explicitly.

| Service | Role |
|---|---|
| `prometheus` | Scrapes everything below. `127.0.0.1`-bound only — never tunnelled, never on the `0.0.0.0` interface. 15-day retention (`--storage.tsdb.retention.time=15d`), a named volume. |
| `grafana` | The only human-facing surface. Auth via `GRAFANA_ADMIN_PASSWORD` (new `.env` var, no default — no `admin`/`admin`, ever, not even temporarily). Dashboards pre-provisioned from files (see below), not built by hand in the UI. |
| `grafana-cloudflared` | A **second**, Grafana-only Cloudflare Tunnel container, its own token (`CLOUDFLARE_TUNNEL_TOKEN_GRAFANA`, new `.env` var) — separate from `admin`'s prod tunnel. Public reachability is the point (the developer asked for it) — Grafana leaves the machine, Prometheus never does. |
| `postgres-exporter` | `prometheuscommunity/postgres-exporter`, points at the same `postgres` service preprod already runs. |
| `redis-exporter` | `oliver006/redis_exporter`, points at the same `redis` service. |
| `node-exporter` | Host-level CPU/memory/disk/network — mounts `/proc`, `/sys`, `/` read-only per the official image's documented pattern. |
| `cadvisor` | Per-container CPU/memory/network I/O across the whole preprod stack — what actually answers "network load" per service, which `node-exporter` alone cannot (it reports the host's interfaces, not per-container attribution). |

`apps/api/src/infra/observability/metrics.service.ts` is rewritten on top of `prom-client`
instead of hand-rolled Prometheus text formatting — this is what makes process
CPU/memory/event-loop-lag/GC data exist at all; the current service structurally cannot
produce it. `GET /metrics` keeps its route and its `METRICS_TOKEN` bearer-auth gate unchanged;
only what backs it changes. `MetricsService.record()`'s call site (wherever the HTTP
interceptor invokes it today) is updated to feed a `prom-client` `Histogram` instead of the
hand-rolled counter map, which is also what makes real percentile buckets (not just
mean-per-route) possible in Grafana — deferred to whoever builds the dashboards' queries, not
decided further here.

Grafana dashboards are provisioned from files (Grafana's file-based provisioning, pointing at
either vendored JSON or `grafana.com` dashboard IDs) for: Node.js process (`prom-client`'s
default metrics — a standard community dashboard exists for this exact library), PostgreSQL
(`postgres-exporter`'s own reference dashboard), Redis (`redis_exporter`'s own reference
dashboard), and container stats (a standard `cAdvisor` dashboard). Exact dashboard IDs are an
implementation detail, not a decision this ADR fixes — pick current, actively-maintained ones
at implementation time rather than hardcoding IDs into this record.

## Consequences

- **Easier**: real process/DB/cache/container/network visibility on the developer's own
  machine, on demand, with zero effect on anyone who never runs `task observability:up`.
- **Harder / explicitly out of scope**: nothing here reaches `docker-compose.prod.yaml` or any
  remotely-deployed environment — if this stack is later wanted in production, that is a
  separate ADR, and per the "large projects" discussion during grill-me it would look
  different there anyway (short local Prometheus retention + remote-write to Thanos/Mimir/
  VictoriaMetrics, Grafana behind SSO rather than a single shared password, Alertmanager,
  dashboards as code). Nothing here should be read as a step toward that without a new
  decision.
- **Mandatory**: the Cloudflare Tunnel for Grafana is a manual account-side setup the
  implementation cannot complete unattended — ships as a runbook/wizard script, and the
  `grafana-cloudflared` service will not come up healthy until the developer has created the
  tunnel and set `CLOUDFLARE_TUNNEL_TOKEN_GRAFANA`.
- Rewriting `MetricsService` onto `prom-client` is a real, if small, behavioural change to an
  existing production route (`GET /metrics` is not preprod-only — it exists in `prod.yaml`'s
  `api` service too). The route, auth and response content-type stay the same; only the
  metric names/labels under the hood change, which invalidates any external scrape config
  already pointed at the old hand-rolled counter names — none is known to exist today, but
  verify before merging.
- ADR-0043 is superseded, not deleted — its proposal and the reasoning behind picking this
  path instead are preserved for anyone who later wonders why the admin panel has no
  load-metrics widget.

## Alternatives considered

- **Admin-panel widget (ADR-0043's original proposal).** Superseded — see Context.
- **`node_exporter` only, no `cAdvisor`.** Rejected: host-level metrics cannot attribute
  network/CPU/memory to one service versus another, which was the explicit ask ("сетевая
  нагрузка" per service, not just the machine as a whole).
- **Ship this straight to `docker-compose.prod.yaml`.** Rejected for this ADR — the developer
  explicitly wants to see it work locally first; a prod rollout is a distinct future decision,
  not assumed here.
- **Reuse `admin`'s existing Cloudflare Tunnel/token for Grafana.** Rejected: different
  compose file, different environment (preprod vs prod), and Cloudflare Tunnel tokens are
  bound to one tunnel configuration — sharing one across environments couples their
  availability and blast radius for no benefit.
