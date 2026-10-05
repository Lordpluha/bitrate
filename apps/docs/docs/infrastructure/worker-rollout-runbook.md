# Transcode worker rollout and rollback runbook

Staged production rollout of the standalone transcode worker (ADR-0049, epic #206, issue #211).
Until the last switch is flipped, the `api` container keeps consuming the `audio-processing`
queue itself, so merging the code changes nothing in production by itself.

All commands run on the server from `~/bitrate` and use `task` (see
[Deployment](./deployment.md)). The one switch is the GitHub **environment variable**
`AUDIO_PROCESSING_WORKER_ENABLED` of the `production` environment (a variable, not a secret). The
deploy workflow renders it into the server's `.env` when set; when it is unset, the compose
default `true` applies to `api`. The `worker` service always forces it to `true`.

## 1. Prerequisites

1. The one-off `api_storage` copy into the bucket is done
   ([copy the retired `api_storage` volume](./deployment.md#one-off-copy-the-retired-api_storage-volume-into-the-bucket)).
   Do not deploy the object-store release before it.
2. SeaweedFS is healthy and the worker container is healthy:

   ```bash
   docker compose --env-file .env -f infra/docker-compose.prod.yaml ps
   docker compose --env-file .env -f infra/docker-compose.prod.yaml exec worker node -e \
     "require('http').get('http://127.0.0.1:9101/health/ready',r=>{console.log(r.statusCode);process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"
   task prod:worker:logs
   ```

   `seaweedfs` and `worker` must show `healthy`, and `/health/ready` must print `200`
   (readiness checks Redis, Postgres and SeaweedFS; the container healthcheck itself only probes
   `/health/live`).

## 2. Both consumers run for a short window

This is the state after the first deploy: `api` and `worker` both consume. Upload a short track
and confirm it is processed exactly once. The job id is deterministic
(`convert-audio-<trackId>-<file>`) and BullMQ hands a job to one consumer only:

```bash
task prod:logs -- api worker   # exactly one of the two logs the processing of the job
```

Also check the counters (see step 3 for how to read `/metrics`): `bitrate_worker_jobs_total`
counts only jobs the worker took. A track that was handled by `api` does not increment it.
A job that appears in both logs, or a duplicated rendition, stops the rollout: leave
`AUDIO_PROCESSING_WORKER_ENABLED` alone and investigate.

## 3. Wait for an empty queue

Do not flip the switch while jobs are in flight. Read the worker's metrics, which expose the
BullMQ queue gauges. `/metrics` is protected by the `METRICS_TOKEN` bearer and is disabled when
that secret is unset:

```bash
docker compose --env-file .env -f infra/docker-compose.prod.yaml exec worker node -e \
  "fetch('http://127.0.0.1:9101/metrics',{headers:{authorization:'Bearer '+process.env.METRICS_TOKEN}}).then(r=>r.text()).then(t=>console.log(t.split('\n').filter(l=>l.startsWith('bitrate_worker_queue_jobs{')&&l.includes('queue=\"audio-processing\"')).join('\n')))"
```

Proceed when `state="waiting"`, `state="active"` and `state="delayed"` are all `0` for
`queue="audio-processing"`. A non-zero `state="failed"` is expected history, not a blocker.
Without `METRICS_TOKEN`, count the keys directly in Redis instead:

```bash
docker compose --env-file .env -f infra/docker-compose.prod.yaml exec redis sh -c \
  'for s in wait active delayed; do printf "%s " $s; redis-cli --no-auth-warning -a "$REDIS_PASSWORD" --raw llen bull:audio-processing:$s; done'
```

Both must print `0` (`delayed` is a sorted set; check it with `zcard` the same way).

## 4. Flip the switch

1. GitHub, Settings, Environments, `production`, Variables: add
   `AUDIO_PROCESSING_WORKER_ENABLED` with the value `false` (only `true` or `false` is accepted;
   the preflight step rejects anything else).
2. Re-run the deploy workflow for the current release. `api` is recreated without the consumer;
   `worker` is unchanged apart from the shared environment.
3. Confirm the rendered name is in the deploy log's `names:` line, and on the server:

   ```bash
   docker compose --env-file .env -f infra/docker-compose.prod.yaml exec api printenv AUDIO_PROCESSING_WORKER_ENABLED
   ```

   It must print `false`.

## 5. Verify exclusive consumption (AC-5)

1. Upload a track through the product.
2. `task prod:worker:logs` shows the job being processed; `task prod:logs -- api` shows no
   processing lines for it.
3. `bitrate_worker_jobs_total{outcome="completed"}` rose by one (command from step 3).
4. Play the track. Media is served through the API (`/static/...` and the stream endpoints); the
   browser's network panel must show no request to the object store (SeaweedFS has no public
   route, so any such URL is a bug).

## 6. Verify retry after a killed worker (AC-6)

1. Upload a long-enough track to keep the worker busy, and wait until the worker logs the job
   as started.
2. Kill the worker mid-job:

   ```bash
   docker kill bitrate-worker-prod
   ```

   `restart: always` brings it back. BullMQ marks the orphaned job stalled and retries it
   (the queue allows 5 attempts).
3. The restarted worker logs the same job id again and completes it once. Confirm the track has a
   single set of renditions and `bitrate_worker_jobs_total{outcome="completed"}` rose by one, not
   two.

## 7. A hung worker (D23)

`restart` reacts to an exit only. A worker whose event loop hangs is flagged `unhealthy` by the
Docker healthcheck (after three failed 30 s probes) and, where Prometheus scrapes it,
`up{job="bitrate-worker"}` drops to `0`, but Docker does not restart it. Restart it by hand:

```bash
docker compose --env-file .env -f infra/docker-compose.prod.yaml restart worker
```

The 300 s `stop_grace_period` lets a healthy-but-slow job finish; for a truly hung process,
Docker sends SIGKILL after the grace period and BullMQ retries the job. Automatic recovery
(a watchdog such as autoheal) is left to the owner (ADR-0049).

## Rollback

Set `AUDIO_PROCESSING_WORKER_ENABLED` back to `true`, or delete the variable, and re-run the
deploy workflow. `api` consumes the queue again; the worker may stay up (both consumers is the
safe state from step 2). Queued jobs are not lost: they sit in Redis until a consumer takes them.

There is no storage rollback: the local storage driver and the `api_storage` volume are removed
(ADR-0050), and audio lives only in the object store.

Bucket backups are deferred (ADR-0050, D18). Revisit them before real content is stored.

## Rehearsal on the dev stack

`task dev:up` starts `api` and `worker` (both consume by default) plus SeaweedFS and Redis, so
steps 2 to 7 can be rehearsed locally:

```bash
task dev:up
task worker:logs                      # the dev worker's logs
```

- Step 2: upload a track against the dev API and watch `task worker:logs` next to the `api` logs.
- Step 3: the dev worker's metrics token is `dev-metrics-token-local-only-0001`, so the same
  `node -e` from step 3 works through `docker compose -f
  infra/docker-compose.preprod.yaml exec worker ...`. The dev Redis has no password and the
  container is `redis`, so use `redis-cli llen bull:audio-processing:wait` there.
- Step 4: restart with the consumer off in `api`:

  ```bash
  AUDIO_PROCESSING_WORKER_ENABLED=false task dev:up
  ```

- Steps 5 to 7 are the same, with the container name `bitrate-worker` in `docker kill` and
  `restart worker` through `docker compose -f infra/docker-compose.preprod.yaml`.
