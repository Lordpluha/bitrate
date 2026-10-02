---
"@bitrate/api": minor
---

Remove the local storage driver: `STORAGE_DRIVER` and `LocalStorageService` are gone and `STORAGE_SERVICE` is always the S3-compatible object store (breaking: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY` and `S3_SECRET_KEY` are now required to boot, and the transcode worker no longer has a production guard against the local driver). `task infra:up` now starts SeaweedFS with its bucket, `task dev:up` starts the standalone worker with the rest of the stack (the `worker` compose profile and `worker:up`/`worker:down` are removed), and integration and e2e specs run against SeaweedFS.
