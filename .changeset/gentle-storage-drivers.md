---
'@spotify/api': minor
---

Add a StorageService driver abstraction for track audio/HLS storage, selectable via the new `STORAGE_DRIVER` env var (`s3` or `local`, defaulting to `local`). The local filesystem driver provides full feature parity with the existing S3 driver, including HTTP Range-request progressive streaming, HLS playlist/segment serving, and a signed-URL equivalent of S3 presigned URLs. S3 credentials are now only required when `STORAGE_DRIVER=s3`, so a fresh clone can boot without configuring MinIO/AWS.
