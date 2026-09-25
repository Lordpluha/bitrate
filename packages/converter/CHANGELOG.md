# @bitrate/converter

## 2.1.0

### Minor Changes

- 43c90ca: Added a durable per-attempt processing log for the audio pipeline
  (`TrackProcessingAttempt`, one row per BullMQ attempt — successes compact, failures carrying
  the redacted step/error detail) and the operator endpoint that reads it:
  `GET /admin/tracks/:id/processing-attempts` (`tracks:read`, newest first, paginated,
  404 for an unknown id, reachable for a soft-deleted track). `@bitrate/converter`'s FFmpeg
  calls now run through a bounded stderr ring buffer and throw a typed `FfmpegError` carrying
  `exitCode`/`signal`/`timedOut`/`stderrTail`, which the API classifies and redacts before
  persisting. The operator panel's track detail page (`/catalog/:id`) now has a "Processing
  history" section reading that endpoint — a table of attempts with their trigger, outcome
  badge, failed step, duration, error code/message, `willRetry`/`retryable` wording, and worker
  host, with a keyboard-operable diagnostics disclosure (command line, stderr tail, stack, and
  a clipboard "Copy diagnostics" action) on any attempt that has detail to show. A track stuck
  processing or with a failed row on the catalog list, and its own detail page, now link to
  this section directly. The failed/stuck take-down and restore conflict messages on the track
  detail page now say "taken down" instead of the account-oriented "deactivated" wording they
  borrowed from the users/artists screens.

## 2.0.0

### Major Changes

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.

### Minor Changes

- abe3615: `gen:api` now formats what it writes. `astToString` emits the TypeScript
  printer's own style — semicolons and a four-space indent — while the committed
  `src/api/v1.ts` is Biome-formatted, so regenerating always reported the whole
  file as changed and the CI reproducibility check could never pass on any branch.
  The generator runs Biome over its output, making the command idempotent, and
  `openapi-typescript` is now declared as a dependency of the package that imports
  it rather than being borrowed from another workspace via hoisting.

  The converter also exposes its CMAF and MP4 index helpers as package exports,
  and its test suite runs in CI alongside the API that consumes it.

## 1.1.0

### Minor Changes

- eedc147: Add adaptive HLS audio variants, resilient hls.js playback, and an atomic BullMQ conversion pipeline with versioned jobs, retries, FFmpeg timeouts, stale-job protection, cleanup, and processing statuses.
