# ADR-0060: On-demand load testing against a production-built API

Status: Proposed

Date: 2026-10-09

## Context

[ADR-0030](0030-remove-performance-testing.md) deleted the k6 suite and its CI workflows. Most of
their failures were harness defects, not performance problems: the global throttler capped the
load, the five-minute access token expired mid-run, and the seed was broken. Their p95 thresholds
also had no real traffic to calibrate against. ADR-0030 says a revived suite should assert rather
than only produce artifacts, and must not bring those defects back.

The question now is narrower than what the old suite tried to answer: where is the API's ceiling,
and which resource breaks first. One CI threshold cannot answer that. It takes a ramp that runs
until something breaks, with the API's own metrics next to the client's.

That cannot be measured against production from one machine. nginx allows 10 r/s per address
(`limit_req zone=api_limit`), the Nest throttler allows 100 requests a minute, and the auth
routes keep 10 a minute no matter what the environment says. A test sending more than about two
requests a second to production measures those limits. A ramp to the breaking point would also
take production down for real listeners.

## Decision

Load testing is **on demand and local**. Nothing runs in CI, on a schedule or on a pull request.
`task load:*` owns it, and `infra/load/README.md` documents it.

- **Ceiling and bottlenecks are measured on a stand.** `infra/docker-compose.loadtest.yaml` runs the
  production build target of `apps/api` under production's 512 MiB limit and a configurable CPU
  limit. It uses the developer's seeded `infra:up` stack and joins the observability network as
  `api`, so the existing Prometheus job scrapes it and the Grafana dashboard
  `k6-load-test.json` shows the client and server views together.
- **The stand is configured so the test measures the API, not its own setup.**
  `JWT_ACCESS_EXPIRES_IN=6h` with one login in `setup()`; `API_RATE_LIMIT_MAX` raised;
  `TRUST_PROXY_HOPS=1`, and k6 gives each virtual user its own `X-Forwarded-For` address. Per-route
  `@Throttle` ceilings and `AUTH_ROUTE_THROTTLE` stay exactly as in production and apply per
  simulated listener, the way they apply to real ones. No API code changes to make room for the
  test.
- **Production gets only `prod-smoke`.** It sends anonymous reads at 1 request/s for two minutes,
  with at most 5 VUs, and aborts on a 2% error rate. The script refuses any other profile when
  `TARGET=prod`, and the task asks for confirmation. It checks the real network, TLS and nginx path
  while staying inside every limit.
- **Profiles use arrival-rate executors** (smoke, load, stress, breakpoint, spike, soak), so a slow
  API shows up as rising latency and dropped iterations instead of quietly lowering the offered
  load. Only `breakpoint` and `prod-smoke` abort on thresholds. In the other profiles the latency
  thresholds only report: until real traffic exists they are starting points, not SLOs.

## Consequences

- A developer can find the request rate at which the API degrades, and see whether CPU, the event
  loop, memory, or an open-handle plateau (a pool) gave out first.
- The numbers are relative. The stand shares the host with k6, Postgres and Redis, and its CPU
  limit only approximates the production host. Use them to compare runs and changes, not as
  production capacity.
- The test writes listening history into the development database it runs against.
- The observability Prometheus now accepts remote write (`--web.enable-remote-write-receiver`).
  It is reachable only on the compose network and 127.0.0.1.
- Still out of scope, as ADR-0030 left them: bundle-size gating, Lighthouse, a slow-query report, and
  any CI regression gate. If production traffic or an SLA appears, a CI gate can be built on these
  profiles with thresholds taken from observed traffic.

## Alternatives considered

- **Restore the ADR-0030 suite from `cb4b7c0e`** — rejected. It would bring back its defects, and
  it answered "is p95 under a guess" on a shared runner, not "where is the ceiling".
- **Run the ceiling test against production with the load generator's address allowlisted in nginx
  and the throttler** — rejected for now. It adds a bypass to security-sensitive code, needs a
  production deploy, and can still take the service down for listeners.
- **Raise production rate limits for a test window** — rejected. For that window every address
  loses flood protection.
- **Distributed load from many addresses (k6 Cloud)** — not chosen. It costs money, and it
  measures the limits working as designed rather than the API.
