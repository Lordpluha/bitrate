# ADR-0049: Transcode worker process boundary and job contract

Status: Accepted

Date: 2026-09-30

Revised 2026-10-01 before merge: storage topology (object storage, no shared volume), the
job contract and browser-facing URLs now follow the owner's revised plan on epic #206.

Epic #206's body refers to this record as ADR-0048; that number was taken by
[ADR-0048](./0048-pnpm-12-and-explicit-build-policy.md), so it is ADR-0049. The object-storage
decision itself is recorded in ADR-0050, forthcoming from #264.

Sub-issues: #264 (SeaweedFS service, spike, CI spec, ADR-0050), #265 (storage-backed pipeline),
#208 (worker entrypoint), #209 (compose service), #210 (health/metrics), #211 (rollout).

## Context

Audio conversion (`AudioProcessingConsumer`, FFmpeg through `@bitrate/converter`) runs inside
the API process. CPU-heavy encodes compete with request handling, and the two cannot be sized or
restarted independently. Epic #206 extracts the consumer into its own process. Before extracting,
this record fixes what that process needs, so the next issue (#208) is a mechanical move.

The [tech roadmap](../strategy/tech-roadmap.md) lists microservices under "What not to build" and
says that "extracting the transcode worker is the one split with an actual reason". This is
deliberately **one** split: same repository, same image, same database, queues and object store,
a second entrypoint, and no shared filesystem between the two processes. It is not a precedent for further services.

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
- The worker entrypoint (#208) refuses to start with `NODE_ENV=production` and
  `STORAGE_DRIVER=local`: a local driver would silently reintroduce the shared-filesystem
  assumption this record removes.
- The API runs with it `false`, so an API process registers the consumer class but never starts a
  BullMQ worker. Neither `infra/docker-compose.prod.yaml` nor `infra/docker-compose.preprod.yaml`
  sets it today, so setting `false` on the `api` service is a change that ships with the worker
  service (#208/#209), not existing state. Until then the API remains the consumer, which is the
  safe default. The flag is not part of the storage topology: it must stay `true` anywhere only one
  process exists.
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

Today the API stores everything under `process.cwd()/storage`. In `infra/docker-compose.prod.yaml`
that is the `api_storage` named volume mounted at `/app/storage`; `infra/docker-compose.preprod.yaml`
declares no such volume for the API at the time of writing.

**Decided topology (revised).** `api` and `worker` share no filesystem. Audio lives in SeaweedFS, a
single-node S3-compatible object store added to the compose stack on the internal network only. It
is reached through `STORAGE_SERVICE` with `STORAGE_DRIVER=s3`, which already exists
(see [ADR-0033](./0033-off-host-backups-and-object-storage.md)). MinIO is excluded: its Community
Edition has been source-only since October 2025 and its repository was archived in April 2026. The
object-storage decision itself, including the SeaweedFS spike, is recorded in ADR-0050, to be
written in #264 together with the compose service and a CI spec.

The worker's only local disk use is per-job scratch space on a `worker_tmp` named volume. It is a
disk volume, not tmpfs, so encodes do not count against the container's memory limit. The scratch
directory is cleaned when the worker starts, so a crashed attempt leaves nothing behind.

**Browser-facing URLs.** `S3Service` signs presigned URLs against the internal `S3_ENDPOINT`
(`getSignedUrl` is given the client built from it). `S3_PUBLIC_URL` is read into the config and
declared in `env.schema.ts` but is not used for signing, so a URL minted today would point at a host
a browser cannot reach. Decision: the object store is never published. With the S3 driver,
`getPresignedUrl` returns a signed token URL served by the API, and
`StorageController.streamSignedObject` reads the object through `STORAGE_SERVICE`, as it already
does for the local driver. HLS and ranged streaming are already proxied by the API through
`getObjectStream`, so playback needs no change. #265 implements this.

**Backups are out of scope** by the owner's decision. Audio uploaded after the cutover has no
off-host copy; that is an accepted risk, recorded fully in ADR-0050.

### Job contract (`ConvertAudioJob`)

Fields: `trackId`, `artistId`, `sourceFileName`, `inputPath`, `outputDir`, `format`, `bitrates`,
optional `trigger`, optional `input` probe. Every field is serialised into the Redis job, and the
consumer reads only `job.data`, its own database rows and storage, with no reliance on in-memory API
state. The payload is self-contained as data, but **not** as a portable contract:

- `inputPath` and `outputDir` are absolute filesystem paths computed on the API side from the API's
  `process.cwd()` (`storage.getTracksDir`). They are valid in another process only if it has the same
  working-directory layout and the same mounted volume. Multer also writes the uploaded master to the
  API's local disk, and `prepareVariants` and the HLS and CMAF generators read it from there, even
  with `STORAGE_DRIVER=s3`. Only the encoded artifacts go through `STORAGE_SERVICE`.
- `artistId` is carried but not read by the consumer.

**Decided design (breaking change allowed, D15; implemented by #265).**

- The payload carries the master's storage key only: no `inputPath`, no `outputDir`.
- The API uploads the master to `STORAGE_SERVICE` **before** enqueueing the job.
- The worker downloads the master into a per-job scratch directory on `worker_tmp`, encodes there,
  uploads the artifacts, and removes the scratch directory; the volume is also cleaned on start.
- The consumer validates the payload, and a job with an unrecognised shape goes to the dead-letter
  queue with a recorded reason instead of throwing and being retried five times. This validation is
  also part of #265.

**In-flight jobs.** A cutover with jobs still queued would run them with the old payload shape.
Mitigation: the runbook (#211) waits for an empty `audio-processing` queue (nothing waiting, nothing
active) before deploying the new contract, with the dead-letter routing above as the second line.

## Consequences

- #208 has a concrete provider list and a composition to build, instead of rediscovering that
  `TracksModule` and `StorageModule` pull in the auth graph.
- `StorageController` leaves the worker's dependency path through a small, behavior-neutral split.
- Until the worker has its own compose service and the API sets the flag off, nothing changes at
  runtime.
- The worker and API stay in one repository and image, so contract changes remain a single PR.
- The supported topology is `api` and `worker` with no shared filesystem, both talking to an
  internal-only SeaweedFS through `STORAGE_SERVICE`. The worker can therefore run on a different
  host from the API, which also unblocks multi-host plans such as #182.
- Uploads gain one extra hop (master to object storage before enqueue) and the worker one extra
  download; the cost is accepted for the removed coupling.
- `S3Service` URL signing must change before the S3 driver serves browsers (#265); it is not safe
  to enable `STORAGE_DRIVER=s3` for user-facing URLs until then.
- Audio uploaded after the cutover has no off-host copy (backups are out of scope, see above).
- The worker's health and metrics (#210) are new surface that must stay unpublished and
  token-protected.

## Alternatives considered

- **A separate repository or service** — not chosen: the tech roadmap rules out microservices, and
  the consumer shares Prisma models and queue types with the API.
- **Import `TracksModule` in the worker context and disable the HTTP parts** — not chosen: it still
  instantiates the gateway, the auth graph and `JWT_SECRET` validation in a process that needs none
  of them, and hides the real boundary.
- **Keep the consumer in the API and scale the API** — not chosen: encoding still cannot be sized or
  restarted independently of request serving.
- **A dedicated scoped Prisma module** — not chosen: `PrismaModule` is already a dependency-free leaf.
- **Keep the shared `api_storage` volume** — not chosen: it ties the worker to the API's host and
  working-directory layout, blocks multi-host deployment, and makes a second container depend on
  the API container's writable paths.
- **Publish the object store to browsers** — not chosen: it exposes a second public surface with its
  own credentials and TLS, and bypasses the API's signed-token authorization. Presigned URLs against
  an internal endpoint do not work anyway, as found above.
- **MinIO as the object store** — not chosen: Community Edition is source-only since October 2025
  and its repository was archived in April 2026.
- **A full `NestFactory.create` app with a hidden HTTP port** — not chosen: it brings Express,
  middleware and interceptors for the sake of two health routes.
