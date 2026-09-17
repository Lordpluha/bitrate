---
'@bitrate/converter': minor
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/admin': minor
---

Added a durable per-attempt processing log for the audio pipeline
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
