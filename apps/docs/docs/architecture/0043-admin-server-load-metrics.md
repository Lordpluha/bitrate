# ADR-0043: Server/API load metrics in the admin panel

Status: Superseded by [ADR-0044](./0044-observability-stack-prometheus-grafana.md)

Date: 2026-09-23

> During grill-me review, the developer chose a standalone Prometheus + Grafana stack
> (ADR-0044) instead of admin-panel integration. Kept here unedited as the record of what
> was proposed and why it was not the final direction — see ADR-0044 for the actual decision.

## Context

The operator panel's overview page shows only business metrics — uploads, listens, reports,
new accounts — sourced from `AdminOverviewService` (`apps/api/src/modules/admin/overview/`).
Nothing shows the API's own health under load: process memory/CPU, event-loop lag, BullMQ
queue depth, or the Postgres connection pool.

Some of the raw material already exists, but none of it reaches an operator today:

- `GET /metrics` (`apps/api/src/app.controller.ts`) — a bearer-token-protected Prometheus
  text endpoint (`MetricsService`, `apps/api/src/infra/observability/metrics.service.ts`).
  It tracks exactly two things: per-route HTTP request count and cumulative duration. No
  memory, CPU, event-loop lag, queue depth, or DB pool metric exists anywhere in the
  codebase yet.
- `GET /health`, `/health/live`, `/health/ready` — boolean up/down checks against Postgres,
  Redis, and storage. No magnitude, no history.
- `infra/docker-monitor.sh` (`task monitor:*`) — a developer-facing CLI script that inspects
  container health/resources/db/errors from a terminal. Not part of the admin panel, not
  read by any API route.
- No Prometheus or Grafana service exists in any `infra/*.yaml` compose file — `/metrics` has
  no scraper today.
- Two BullMQ queues exist (`apps/api/src/modules/tracks/tracks.module.ts`):
  `AUDIO_PROCESSING_QUEUE` and `AUDIO_PROCESSING_DEAD_LETTER_QUEUE`. BullMQ's own `Queue`
  object exposes waiting/active/completed/failed/delayed job counts, but nothing in the API
  reads them.
- Prisma's connection pool uses its default (`num_cpus * 2 + 1`) — `schema.prisma` sets no
  `connection_limit`, and nothing reports its current usage.

An operator today has no way to see "is the API under load right now" without SSHing in and
running the CLI script.

## Decision

Add a **new, admin-authenticated JSON endpoint** — not a reuse of `/metrics` (Prometheus text
is the wrong shape for a UI fetch) and not a bearer-token side channel. It sits beside
`AdminOverviewService`, same permission model:

```
apps/api/src/modules/admin/system-load/
  admin-system-load.controller.ts   GET admin/system-load, @RequirePermission('system-load:read')
  admin-system-load.service.ts      gathers the snapshot below
  admin-system-load.module.ts
  decorators/get-system-load.swagger.ts
  dtos/  entities/  __tests__/
```

Response shape (one point-in-time snapshot, polled by the admin panel — no new persistence,
no time-series storage in this ADR):

```ts
type SystemLoadEntity = {
  process: { rssBytes: number; heapUsedBytes: number; heapTotalBytes: number; uptimeSeconds: number }
  eventLoopLagMs: number          // from perf_hooks' monitorEventLoopDelay
  http: { requestsPerMinute: number; p50DurationMs: number; p95DurationMs: number }
  queues: Array<{ name: string; waiting: number; active: number; failed: number; delayed: number }>
  database: { activeConnections: number; idleConnections: number; poolMax: number }
}
```

- `process`/`eventLoopLagMs` — Node's own `process.memoryUsage()`,
  `process.cpuUsage()`, and `perf_hooks.monitorEventLoopDelay()`. No new dependency.
- `http` — extends `MetricsService` (already tracks count/duration per route) with a
  rolling window and percentile buckets, rather than only Prometheus counters. `render()`
  (the `/metrics` text output) stays as-is; the service gains a second read method for this
  endpoint.
- `queues` — inject each registered `Queue` (`@InjectQueue(AUDIO_PROCESSING_QUEUE)` etc.) and
  call its `getJobCounts()`. Iterate the two known queues explicitly — this module does not
  attempt to discover queues dynamically.
- `database` — Prisma 7 exposes pool metrics via `$metrics.json()`
  (`previewFeatures = ["metrics"]` needed in `schema.prisma` if not already enabled — verify
  during implementation, this ADR does not assume it is).

Admin panel: one new chart-style card on the overview page (reuse `LineChart`/`BarChart` +
`ChartHeadline`, no new chart primitive), polling `GET admin/system-load` on an interval —
short-lived, in-memory, client-side history only. No new persisted time series, no new domain
entity beyond the response DTO above.

## Consequences

- **Easier**: an operator sees load without SSH access; the same permission/DTO/Swagger
  pattern as every other admin endpoint applies unchanged, so `admin-list-query-coverage` /
  `admin-auth-coverage` style specs extend to this module with no new mechanism.
- **Harder / explicitly out of scope for this ADR**: historical trends beyond what the
  client keeps in memory while the tab is open — a real time-series store (Prometheus +
  Grafana, or writing snapshots to Postgres/Redis) is a separate, larger decision and is
  **not** decided here. If it's wanted, it needs its own ADR before implementation, per the
  "Prometheus/Grafana" option this ADR explicitly did not choose (see Alternatives).
- **Mandatory**: verify Prisma 7's `$metrics` API is actually available under this project's
  Prisma version/config before implementing the `database` field — if not, that field ships
  as `null` with a documented reason rather than blocking the rest of the endpoint.
- A new permission (`system-load:read`) needs adding to
  `apps/api/src/modules/admin-auth/access/permissions.ts` and to at least one role/template,
  per ADR-0038's rubric — added, never inserted by renaming an existing one.
- The polling interval needs to stay well clear of the endpoint's own overhead becoming part
  of the load it reports — a poll every 5-10s is the working assumption, tune during review.

## Alternatives considered

- **Stand up Prometheus + Grafana in `infra/`, embed/link a Grafana dashboard instead of
  building a panel widget.** Rejected as the *first* step: it is real infrastructure (a new
  service, retention/storage sizing, auth for the Grafana UI, and either an iframe embed with
  its own CSP/auth story or an external link that takes the operator out of the panel) for a
  need that a single polled JSON endpoint already satisfies today. Worth revisiting once
  historical trends (not just "right now") are actually wanted — see Consequences.
- **Reuse `GET /metrics` directly from the admin panel.** Rejected — it's Prometheus text
  format, bearer-token gated (a different auth mechanism than the operator's cookie session),
  and only carries HTTP route counters; it would need parsing client-side and still wouldn't
  carry queue/DB/process data.
- **Persist snapshots to Postgres/Redis for real history now.** Rejected for this ADR: no
  operator need has been stated for anything beyond "what's happening right now," and adding
  a write-heavy background job to store metrics is exactly the kind of infra decision that
  deserves its own ADR once someone actually asks for a trend view.
