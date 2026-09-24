# Observability — Prometheus + Grafana + Loki

See [ADR-0044](../../apps/docs/docs/architecture/0044-observability-stack-prometheus-grafana.md)
(metrics) and [ADR-0046](../../apps/docs/docs/architecture/0046-loki-log-aggregation.md) (logs)
for the decisions behind everything here. In short: local-machine-only, entirely optional,
never touches production or anything remotely deployed. Nothing in this directory starts with
a plain `task dev:up` — it needs `task observability:up`, gated behind a Compose `profiles:`
entry the same way `mobile`/`desktop` already are.

## What's here

| Service | Role |
|---|---|
| `prometheus` | Scrapes everything below. `127.0.0.1`-bound only — never leaves the machine. |
| `grafana` | The dashboards and log Explore view. The only piece meant to be reachable — see below. |
| `grafana-cloudflared` | A tunnel dedicated to Grafana, separate from `apps/admin`'s production one. |
| `postgres-exporter`, `redis-exporter` | Official exporters for the `postgres`/`redis` services this same compose file already runs. |
| `node-exporter` | Host-level CPU/memory/disk/network. |
| `cadvisor` | Per-container CPU/memory/network — what actually answers "load per service." |
| `loki` | Log storage. `127.0.0.1`-bound, filesystem-backed, 7-day retention — see ADR-0046. |
| `alloy` | Ships `api` + `nginx`'s Docker container logs to `loki`. Grafana's current agent for this — not Promtail, which is deprecated/removed upstream; see `alloy/config.alloy`'s own header comment. |

`apps/api/src/infra/observability/metrics.service.ts` is what `prometheus`'s `bitrate-api`
scrape target reads from — it's `prom-client`-backed (process CPU/memory/event-loop-lag/GC,
plus the existing per-route HTTP request counter and duration histogram), not a separate
piece of infrastructure.

**Network load** — read it from `cadvisor`'s per-container panels, not `node-exporter`'s.
`node-exporter` stays on the regular `bitrate-network` bridge rather than host networking, so
its CPU/memory/disk figures are the real host's (those are global kernel state), but its own
network-interface panel reflects only its own near-idle container interface. Host networking
would fix that, but there is no way to make a host-networked exporter reachable from
Prometheus while staying unreachable from the LAN at the same time — not a trade worth making
for one panel when `cadvisor` already answers "load per service" correctly.

## Starting it

```bash
task observability:up     # start prometheus, grafana, grafana-cloudflared, the exporters, loki + alloy
task observability:logs   # tail every service's logs
task observability:down   # stop and remove them (task dev:down would stop everything else too)
```

Two `.env` variables gate the two pieces that need a real value:

| Variable | Needed for | Default if unset |
|---|---|---|
| `GRAFANA_ADMIN_PASSWORD` | Grafana's `admin` login | none — Grafana starts with no usable password until you set it |
| `CLOUDFLARE_TUNNEL_TOKEN_GRAFANA` | `grafana-cloudflared` | none — that one container exits immediately until set |

Neither has a hardcoded fallback like this file's Postgres/Redis credentials do, on purpose:
an empty Grafana admin password or an empty tunnel token should be visibly broken, not quietly
accept nothing.

Run `./setup-grafana-tunnel.sh` (from anywhere in the repo) for the tunnel — it's an
interactive wizard that walks you through creating the Cloudflare Tunnel on your own account
and writes the token into the repo-root `.env` for you. Cloudflare Tunnel creation is a
manual, account-specific step no script can do unattended.

## Dashboards

Pre-provisioned from vendored community dashboards in `grafana/dashboards/` (file-based
Grafana provisioning, not built by hand):

| File | Source | Covers |
|---|---|---|
| `nodejs-application.json` | [grafana.com/dashboards/11159](https://grafana.com/grafana/dashboards/11159/) | The API process — `prom-client`'s default metrics |
| `postgresql-database.json` | [grafana.com/dashboards/9628](https://grafana.com/grafana/dashboards/9628/) | `postgres-exporter` |
| `redis-exporter.json` | [grafana.com/dashboards/763](https://grafana.com/grafana/dashboards/763/) | `redis-exporter` |
| `node-exporter-full.json` | [grafana.com/dashboards/1860](https://grafana.com/grafana/dashboards/1860/) | `node-exporter` (host-level) |
| `cadvisor.json` | [grafana.com/dashboards/14282](https://grafana.com/grafana/dashboards/14282/) | `cadvisor` (per-container) |

Every file has its original `${DS_PROMETHEUS}`-style datasource placeholder rewritten to the
literal string `prometheus` at vendoring time (three different spellings across the five
files — Grafana's file provisioning does not resolve dashboard-exchange `__inputs` template
variables the way the manual "import" UI flow does). That string must keep matching the `uid:`
in `grafana/provisioning/datasources/prometheus.yml`, or every dashboard's panels go blank.

They're a starting point, not fixed — `editable: true` in the dashboard provider config means
changes made in the Grafana UI persist to Grafana's own SQLite store, not back to these files.

## Logs

No dashboard for logs — the grill-me interview settled on Grafana's **Explore** view only
(ad-hoc LogQL, not a steady-state panel); the `loki` datasource is provisioned so Explore has
something to query. Only `api` and `nginx`'s logs are collected (see ADR-0046 for why those two
and not `postgres`/`redis`/the web frontends); `nginx` only runs under `--profile production`,
separate from `observability`, so its logs only show up in Loki when it happens to be running.

Two things worth knowing when actually querying:

- `api`'s logs are JSON (`nestjs-pino`, see `apps/api/src/infra/observability/logger.config.ts`)
  — `alloy/config.alloy` lifts `level` out as a real Loki label; the rest of each line
  (`msg`, `req`, `res`, ...) is still there as JSON text, queryable with LogQL's `| json`.
  `nginx`'s access log stays plain text — use `|= "..."` line filters on it instead.
- `GET /api/v1/metrics` (Prometheus's own scrape target) is deliberately excluded from `api`'s
  auto-request-logging — see `logger.config.ts`'s own comment for why a `req.url` check is used
  there instead of nestjs-pino's `exclude` option, which did not line up with this app's real
  global-prefix + versioning setup when tested.

## The API scrape's bearer token

Prometheus reads `infra/observability/prometheus/prometheus.yml` as a static bind mount — it
does not interpolate `${VAR}` from the shell environment the way Compose interpolates the
compose YAML itself. The scrape config's bearer token is therefore the literal string
`dev-metrics-token`, matching `docker-compose.preprod.yaml`'s `api` service's own
`METRICS_TOKEN` default — a fixed, non-secret local-dev value, the same spirit as this whole
file's `admin`/`admin` Postgres/Redis credentials. If you override `METRICS_TOKEN` for the
`api` service, update `prometheus.yml`'s hardcoded value too, or the scrape starts failing
with 401s (logged by Prometheus as an ordinary failed scrape, not a startup error — easy to
miss).
