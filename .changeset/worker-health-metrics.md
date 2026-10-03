---
"@bitrate/api": minor
---

The transcode worker now answers on an internal-only port (`WORKER_HTTP_PORT`, default 9101, never published): `/health/live`, `/health/ready` (PostgreSQL, the BullMQ Redis connection and the object store) and a `METRICS_TOKEN`-protected `/metrics` with `bitrate_worker_` queue gauges and job counters and durations. The prod and preprod `worker` services get a real Docker healthcheck on `/health/live`, Prometheus scrapes a separate `bitrate-worker` job, and Grafana provisions a "Transcode pipeline" dashboard.
