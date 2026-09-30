# ADR-0049: Transcode worker process boundary and job contract

Status: Accepted

Date: 2026-09-30

Epic #206's body refers to this record as ADR-0048; that number was taken by
[ADR-0048](./0048-pnpm-12-and-explicit-build-policy.md), so it is ADR-0049.

## Context

Audio conversion (`AudioProcessingConsumer`, FFmpeg through `@bitrate/converter`) runs inside
the API process. CPU-heavy encodes compete with request handling, and the two cannot be sized or
restarted independently. Epic #206 extracts the consumer into its own process. Before extracting,
this record fixes what that process needs, so the next issue (#208) is a mechanical move.

The [tech roadmap](../strategy/tech-roadmap.md) lists microservices under "What not to build" and
says that "extracting the transcode worker is the one split with an actual reason". This is
deliberately **one** split: same repository, same image, same database and queues, a second
entrypoint. It is not a precedent for further services.

This is an investigation record. No production code changes with it.

## Decision

The worker is a second entrypoint of `apps/api`, started with
`NestFactory.createApplicationContext` — no Express, Swagger, helmet, CORS or versioning.

### Audit of what the consumer needs

`AudioProcessingConsumer` injects exactly four things: `PrismaService`, `STORAGE_SERVICE`, the
dead-letter queue and `ProcessingAttemptRecorder`. The phase functions
(`audio-processing.phases.ts`, `audio-encoding.ts`, `audio-artifact-storage.ts`,
`audio-track-publication.ts`) receive those as plain arguments or type-only imports. The recorder's
sole dependency is `PrismaService`. None of them touch `CacheService`, `AudioGateway`,
`MetricsService`, i18n or auth. `@sentry/nestjs` is a static import, and `nestjs-pino` is only the
logger.

| Provider / module | Worker | API | Notes |
|---|---|---|---|
| `ConfigModule` (`envSchema`, `appConfigs`) | required | required | `storage` config, `STORAGE_DRIVER`, Redis, S3 keys |
| `BullModule.forRootAsync` (Redis connection) | required | required | Same connection factory in both |
| `BullModule.registerQueue` `audio-processing` | required | required | Worker consumes it; API enqueues |
| `BullModule.registerQueue` `audio-processing-dead-letter` | required | required | Worker writes on final failure; API and admin read |
| `AudioProcessingConsumer` | required | not wanted | Autorun off in the API, see below |
| `ProcessingAttemptRecorder` | required | required | API records enqueue failures; worker records attempts |
| `PrismaModule` / `PrismaService` | required | required | Needs `DATABASE_URL`; `@Global` |
| `STORAGE_SERVICE` (`LocalStorageService` or `S3Service`) | required | required | Selected by `STORAGE_DRIVER` |
| `LoggerModule` (pino) | required | required | Same `loggerOptions` |
| Sentry (`./instrument`, `SentryModule`) | required | required | `instrument.ts` must be imported first in the worker entrypoint too |
| `TracksService`, `TrackUploadService`, `TrackStreamingService`, `TrackPlaybackService` | not needed | required | HTTP-facing; the upload service is the job producer |
| `TracksController`, `AudioGateway` (Socket.io) | not needed | required | The consumer never emits to sockets |
| `CacheModule` (`CacheService`, `REDIS_CLIENT`) | not needed | required | Cache and throttler storage only |
| `UsersAuthModule`, `TokensModule` (`JwtModule`) | not needed | required | Guards for controllers and gateway; pulls in `MailModule` and `UsersModule` |
| `StorageController` | not needed | required | Signed-URL download endpoint; the only reason `StorageModule` imports the auth modules |
| `ThrottlerModule`, `ServeStaticModule`, `I18nModule`, interceptors, `APP_FILTER`, `APP_GUARD`, middleware | not needed | required | HTTP-only |
| `MetricsService` | not reusable as is | required | Its metrics are HTTP-request counters; the worker gets its own registry (see health and metrics) |

**Finding that constrains #208.** `TracksModule` cannot simply be imported by the worker context: it
also registers the controller, the gateway and the whole auth graph. Likewise `StorageModule`
imports `UsersAuthModule` and `TokensModule` only for its controller, so importing it would drag
`JwtModule` (and `JWT_SECRET`), `MailModule` and `UsersModule` into a process that never
authenticates anyone. A worker application module therefore needs a smaller composition.

### A scoped module for Prisma and storage access

- **Prisma: no new module.** `PrismaModule` is already a leaf (`PrismaService` only, no imports).
  The worker imports it as is.
- **Storage: yes, split the provider from the controller.** Introduce a `StorageCoreModule` that
  owns `LocalStorageService` and the `STORAGE_SERVICE` factory and imports nothing from `users-auth`
  or `tokens`. `StorageModule` re-exports it and keeps `StorageController` plus its auth imports, so
  the API's behavior is unchanged. The worker imports only the core module. `STORAGE_SERVICE` stays
  the single seam.
- **Consumer and recorder: a shared `TranscodeModule`** (name for #208 to confirm) providing
  `AudioProcessingConsumer`, `ProcessingAttemptRecorder` and the two `registerQueue` calls. The API's
  `TracksModule` imports it too, so the recorder and queues have one owner instead of being declared
  twice. The worker root module is then `ConfigModule` + `LoggerModule` +
  `BullModule.forRootAsync` + `PrismaModule` + `StorageCoreModule` + `TranscodeModule` + the
  health/metrics provider.

### Autorun flag

`AUDIO_PROCESSING_WORKER_ENABLED` (default `true`) is read from `process.env` at class-definition
time in `audio-processing.worker-autorun.ts`, because `@Processor` options are evaluated before
DI exists. `env.schema.ts` validates it for fail-fast only. Consequences:

- The worker entrypoint must force it on **before** importing the module graph, not merely in config.
- The API runs with it `false`, so an API process registers the consumer class but never starts a
  BullMQ worker. Neither `infra/docker-compose.prod.yaml` nor `infra/docker-compose.preprod.yaml`
  sets it today, so setting `false` on the `api` service is a change that ships with the worker
  service (#208/#209), not existing state. Until then the API remains the consumer, which is the
  safe default.
- Local development keeps the default `true`, so `pnpm dev` still converts audio without a second
  process.

### Entrypoint

Split `bootstrapWorker()` (builds the context and enables shutdown hooks, so BullMQ drains active
jobs on SIGTERM) from a thin `main.worker.ts` that only imports `./instrument`, forces the flag and
calls it. Tests exercise `bootstrapWorker()`; `main.worker.ts` stays untested glue.

### Health and metrics

An application context has no HTTP server. The worker starts a small internal `node:http` listener
on its own port, not published outside the compose network:

- `/health/live` — the process is up.
- `/health/ready` — Prisma and the Redis queue connection respond.
- `/metrics` — Prometheus text from a worker-owned registry (default process metrics plus job
  counters and durations), protected by a `METRICS_TOKEN` bearer, matching the API.

### Storage caveat

The API stores everything under `process.cwd()/storage`. In `infra/docker-compose.prod.yaml` that is
the `api_storage` named volume mounted at `/app/storage`. A worker in a second container sees the
same files only if it mounts the **same volume**, which works on a single host and does not across
hosts. `infra/docker-compose.preprod.yaml` declares no such volume for the API at the time of
writing, so #209 must decide preprod's storage explicitly rather than assume it. Multi-host
deployment (for example #182) requires `STORAGE_DRIVER=s3` (see
[ADR-0033](./0033-off-host-backups-and-object-storage.md)) **and** the source-file change below.

### Job contract (`ConvertAudioJob`)

Fields: `trackId`, `artistId`, `sourceFileName`, `inputPath`, `outputDir`, `format`, `bitrates`,
optional `trigger`, optional `input` probe. Every field is serialised into the Redis job, and the
consumer reads only `job.data`, its own database rows and storage, with no reliance on in-memory API
state. The payload is self-contained as data, but **not** as a portable contract:

- `inputPath` and `outputDir` are absolute filesystem paths computed on the API side from the API's
  `process.cwd()` (`storage.getTracksDir`). They are valid in the worker only if it has the same
  working-directory layout and the same mounted volume. They are also why the worker cannot move to
  another host even with `STORAGE_DRIVER=s3`: Multer writes the uploaded master to the API's local
  disk, and `prepareVariants` and the HLS and CMAF generators read it from there. Only the encoded
  artifacts go through `STORAGE_SERVICE`.
- `artistId` is carried but not read by the consumer.

**Recommendation for #208 (a breaking change is allowed, per D15).** Stop sending absolute paths:
send `sourceFileName` only, and let the worker derive the source and temporary roots from its own
`storage.getTracksDir()`. This removes the path-equality assumption between two processes while
leaving the shared-volume requirement explicit. Uploading the master to `STORAGE_SERVICE` before
enqueue, so the worker downloads it, is the further step that makes a multi-host worker possible;
it is out of scope here.

**In-flight jobs.** A cutover with jobs still queued would run them with the old payload shape.
Mitigation: the runbook waits for an empty `audio-processing` queue (nothing waiting, nothing active)
before deploying a changed contract. As a second line, the consumer validates the payload and sends
an unrecognised job to the dead-letter queue with a recorded reason, instead of throwing and being
retried five times. The existing `trigger` and `input` fields are already optional for this reason.

## Consequences

- #208 has a concrete provider list and a composition to build, instead of rediscovering that
  `TracksModule` and `StorageModule` pull in the auth graph.
- `StorageController` leaves the worker's dependency path through a small, behavior-neutral split.
- Until the worker has its own compose service and the API sets the flag off, nothing changes at
  runtime.
- The worker and API stay in one repository and image, so contract changes remain a single PR.
- A single-host, shared-volume worker is the supported topology. Anything else needs S3 plus a
  changed source-file contract, and is not delivered here.
- The worker's health and metrics are new surface that must stay unpublished and token-protected.

## Alternatives considered

- **A separate repository or service** — not chosen: the tech roadmap rules out microservices, and
  the consumer shares Prisma models and queue types with the API.
- **Import `TracksModule` in the worker context and disable the HTTP parts** — not chosen: it still
  instantiates the gateway, the auth graph and `JWT_SECRET` validation in a process that needs none
  of them, and hides the real boundary.
- **Keep the consumer in the API and scale the API** — not chosen: encoding still cannot be sized or
  restarted independently of request serving.
- **A dedicated scoped Prisma module** — not chosen: `PrismaModule` is already a dependency-free leaf.
- **A full `NestFactory.create` app with a hidden HTTP port** — not chosen: it brings Express,
  middleware and interceptors for the sake of two health routes.
