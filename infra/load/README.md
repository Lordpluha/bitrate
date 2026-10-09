# Load testing

k6 against a production-built API, on demand. Why it looks like this, and why it is not in CI:
[ADR-0060](../../apps/docs/docs/architecture/0060-on-demand-load-testing.md) and its predecessor
[ADR-0030](../../apps/docs/docs/architecture/0030-remove-performance-testing.md).

## Run it

```bash
task infra:up                 # postgres, redis, seaweedfs
task db:seed:native           # once: the catalogue, test@example.com / password123, audio
task observability:up         # Prometheus (+ remote-write receiver) and Grafana
task load:up                  # production image of apps/api on http://localhost:3110

task load:run                         # smoke, 1 minute
task load:run PROFILE=breakpoint      # ramp until it breaks; the rate at abort is the ceiling
task load:run PROFILE=stress RATE=40  # steps of 0.5×…4× RATE

task load:down
```

If observability was already running before this change, run `task observability:up` again so
Prometheus restarts with `--web.enable-remote-write-receiver`. Otherwise k6 logs
`got status code: 404` for every push. The test still runs, but nothing reaches Grafana.

During a run, k6's live dashboard is at http://localhost:5665. Grafana (http://localhost:3006 →
Bitrate → **k6 load test**) shows the client and server views side by side; pick the run in the
**Run** variable. Each run's HTML report is written to `infra/load/results/` (gitignored).

## Profiles

Rates are iterations per second across all three mixes. One iteration is one request for
`browse` and `listener`, and five for `playback`.

| Profile | Shape | Answers |
|---|---|---|
| `smoke` | 3 it/s for 1 min | Does every path still answer? Run it after changing the script or the API. |
| `load` | ramp to `RATE`, hold 10 min | Is latency stable at the expected traffic? |
| `stress` | steps of 0.5, 1, 1.5, 2, 3, 4 × `RATE`, 2 min each | Which step degrades first? |
| `breakpoint` | linear 0 → `MAX_RATE` (400) over 20 min, aborts on >2% errors or p99 blowing up | Where is the ceiling? |
| `spike` | 0.2 × `RATE` → 3 × `RATE` in 10 s, then recovery | Does it recover after a burst? |
| `soak` | 0.6 × `RATE` for 60 min | Memory growth, pool or handle leaks? |
| `prod-smoke` | 1 req/s for 2 min, anonymous, ≤5 VUs | Production network/TLS/nginx path. **The only profile allowed with `TARGET=prod`.** |

Variables: `RATE` (default 20), `MAX_RATE` (400), `DURATION_SCALE` (multiplies every stage, e.g.
`0.25` for a quick try), `MAX_VUS` (1000). The CPU share of the stand's API is
`LOADTEST_API_CPUS` (default 2) at `task load:up`. Set it to the production host's vCPU count.

Traffic mixes (`api.js`):

- **browse** (60%) — anonymous: track lists and details, search, charts, albums, artists,
  categories, the recommendations feed.
- **listener** (25%) — signed in: settings, player state, history, top tracks, own playlists, liked
  tracks, and `POST /history/tracks/:id` (15% of its iterations, the one write).
- **playback** (15%) — what the player does to start a track (ADR-0020): manifest, init segment,
  then three fragments by `Range`.

## Production

```bash
task load:prod-smoke   # asks for confirmation first
```

Production keeps its limits: nginx at 10 r/s per address and the API at 100 requests/min. More
than about two requests a second from one machine measures those limits, and a ramp could take
the service down. The script therefore throws on any other profile when `TARGET=prod`. The ceiling
is measured on the stand.

## Reading a run

- **Dropped iterations > 0** — k6 could not start iterations on schedule. The offered load is no
  longer being delivered, so the API is saturated at that rate.
- **Client p95 ≫ server p95 (Grafana, two rows)** — time is lost before the handler: connection
  queueing, the event loop, or the network.
- **Event-loop lag rising while CPU sits at `LOADTEST_API_CPUS`** — the Node process is CPU-bound.
- **Active handles flat while latency climbs** — requests are waiting for a pool (Prisma/pg or
  Redis).
- **429 in "Responses by status"** — a throttler is being measured. Per-route `@Throttle` limits
  apply per simulated listener, because each VU has its own `X-Forwarded-For`. A 429 therefore
  means one VU exceeded what a real listener could do.

## What it does not do

- Run in CI, on a schedule or on pull requests (ADR-0030, ADR-0060).
- Produce absolute capacity numbers. The stand shares the machine with k6 and the databases, so
  compare runs with each other rather than with production.
- Leave the development database untouched. Listening history accumulates; `task db:seed:native`
  resets it.
