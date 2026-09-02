# @bitrate/api

## 0.1.0

### Minor Changes

- a43dc9e: Add a StorageService driver abstraction for track audio/HLS storage, selectable via the new `STORAGE_DRIVER` env var (`s3` or `local`, defaulting to `local`). The local filesystem driver provides full feature parity with the existing S3 driver, including HTTP Range-request progressive streaming, HLS playlist/segment serving, and a signed-URL equivalent of S3 presigned URLs. S3 credentials are now only required when `STORAGE_DRIVER=s3`, so a fresh clone can boot without configuring MinIO/AWS.

### Patch Changes

- eedc147: Add adaptive HLS audio variants, resilient hls.js playback, and an atomic BullMQ conversion pipeline with versioned jobs, retries, FFmpeg timeouts, stale-job protection, cleanup, and processing statuses.
- 7aaa0f4: Fix authorization and private playlist exposure, make cache fallbacks safe, repair auth request retries and media URLs, and restore Base UI wrapper compatibility.
- Updated dependencies [eedc147]
  - @bitrate/converter@1.1.0
