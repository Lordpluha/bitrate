# ADR-0050: SeaweedFS single-node object storage for audio

Status: Accepted

Date: 2026-10-01

Sub-issue #264 of epic #206. [ADR-0049](./0049-transcode-worker-process-boundary.md) puts the
transcode worker in its own process with no shared filesystem; this record chooses and
provisions the object store that makes that possible. The `STORAGE_DRIVER=s3` driver
(`S3Service`) already existed. Nothing in the stack provided an S3-compatible service.

## Context

Audio lives on the API's local disk (the `api_storage` volume). A separate worker container could
only reach it by sharing that volume, which would bind the worker and the API to one host and
rule out scaling the API later. Object storage removes the shared filesystem: the API and the
worker both talk to a bucket over the compose network.

MinIO was the obvious choice and is excluded. MinIO Community Edition has been source-only since
October 2025 (no maintained binaries or images) and its repository was archived in April 2026.
Building and patching an archived project ourselves is not a plan for a single-server stack.

The host is a single 8 GB server. Whatever runs must be small and run beside the API (512M) and
the worker (1G).

## Decision

1. **Audio moves to object storage.** This replaces the shared-volume topology from the first
   draft of ADR-0049. Cutting `STORAGE_DRIVER` over to `s3` is a separate change (#211); this
   change only provisions the service and proves the driver works against it.
2. **Backend: SeaweedFS** (`chrislusf/seaweedfs:4.48`, pinned), one node, started with
   `weed server -s3` (master, volume server, filer and S3 gateway in one process). No other
   backend is substituted without the owner's decision.
3. **Internal only.** The service declares no `ports:` and has no nginx route; it is reachable
   only from `bitrate-network`. Browsers never see it: the API serves objects through signed
   token URLs (epic decision D16). Only the CI overlay (`infra/docker-compose.ci.yaml`)
   publishes the S3 port, on `127.0.0.1`, so the runner can reach it.
4. **Credentials.** The S3 identity file is generated at container start from `S3_ACCESS_KEY`,
   `S3_SECRET_KEY` and `S3_BUCKET`, so no secret is in the repository or the image. The only
   identity is bucket-scoped (`Read`, `Write`, `List`, `Tagging` on that one bucket); there is no
   root or admin S3 identity. The application cannot create buckets or touch any other.
   The bucket is created by a one-shot `seaweedfs-init` service through the SeaweedFS master
   (`weed shell s3.bucket.create`), which needs no S3 credentials, and is safe to re-run.
5. **Resources and lifecycle.** 1G memory limit (256M reservation) with `GOMEMLIMIT=800MiB`,
   named volume `seaweedfs_data`, `restart: always` in production, and a healthcheck on both the
   master (`/cluster/healthz`) and the S3 gateway (`/healthz`). Idle memory measured in the spike
   was about 140 MB.
6. **Environments.** Production and the preprod stack each run their own instance and bucket;
   the preprod compose file defaults dev-only credentials in the spirit of its `admin`/`admin`
   database login, and rehearses the cutover first. `infra/docker-compose.dev.yaml`
   keeps `STORAGE_DRIVER=local` and is unchanged.
7. **CI.** The `S3Service` integration spec (`apps/api/src/infra/s3/s3.service.int-spec.ts`) runs in
   `api_reusable.yml` against the same service definition the preprod stack ships. A stock
   GitHub Actions service container was not used: it cannot override the image command, and the
   image's default `mini` command takes no S3 identity file. The spec fails, rather than skips,
   when `CI` is set and no endpoint is configured.

## Spike results

Run against SeaweedFS 4.48, single node, with the application identity above, using the AWS SDK v3
client configured exactly as `S3Service` configures it (`endpoint`, `region: us-east-1`,
`forcePathStyle: true`). The same 10-case spec passed against a hand-started container, against
the production compose service, and against the preprod/CI compose service.

| Operation | Result | Evidence |
|---|---|---|
| Buffer `PutObject` | pass | `upload` returns the key; read back equal |
| Streamed `PutObject` (file stream) | pass | 256 KiB file stream round-trips byte for byte; `ContentType` preserved |
| Multipart upload | pass | `CreateMultipartUpload`, two `UploadPart` (5 MiB + 1 KiB), `CompleteMultipartUpload`; read back equal |
| `GetObject` with `Range` | pass | `bytes=2-5` returns `ContentRange: bytes 2-5/10`, length 4, body `2345` |
| `HeadObject` | pass | length and content type returned; a missing key reports 404, which `exists` maps to `false` |
| `DeleteObject` | pass | `exists` is `true`, then `false` |
| `ListObjectsV2` + `DeleteObjects` (`deletePrefix`) | pass | 1100 objects (more than one list page) deleted; a sibling key outside the prefix survives |
| Bucket reachability (`HeadBucket`) | pass | `healthCheck` resolves `true` |
| Presigned URLs | not needed | the object store is never published; the API signs its own token URLs |

Isolation checks with the same identity: `PutObject` to another bucket and `CreateBucket` both
return 403 `AccessDenied`; a wrong secret and an unknown access key both return 403.

One finding that is not a SeaweedFS limitation: `S3Service.upload` passes its body straight to
`PutObjectCommand`. A file stream or a buffer works, but an arbitrary `Readable` of unknown length
(for example `Readable.from(...)`) is rejected by the SDK on the client side, before any request
is sent, and would fail against any S3 backend. The storage-backed pipeline (#265) must upload from
a file stream or a buffer, or use a multipart upload for streams of unknown length.

## Consequences

- The API and the worker share no filesystem, which unblocks ADR-0049 and later API replicas.
- One more container (up to 1G) on an 8 GB host; retune from cAdvisor metrics once it holds real
  data.
- Credentials are new deploy secrets: `S3_ACCESS_KEY` and `S3_SECRET_KEY` (letters and digits
  only, because they are written into JSON by `printf`; the secret at least 24 characters), and an
  optional `S3_BUCKET` variable (default `bitrate-audio`). They are required by the deploy
  workflow even while `STORAGE_DRIVER=local`, because the `seaweedfs` service always starts.
- SeaweedFS is a single node: no replication and no failover. A host failure takes it down.

### Accepted risk: no bucket backups

**Backups of the bucket are out of scope for now (owner's decision, 2026-10-01).** The existing
backup covers PostgreSQL and the `api_storage` volume only; `infra/backup.sh` and the
`/app/storage` tasks are unchanged. After the cutover, audio uploaded to the bucket has no
off-host copy: losing the `seaweedfs_data` volume loses that audio. This is accepted while no real
content is uploaded and **must be revisited before real content is**. The decision to switch the
driver should depend on that revisit.

## Alternatives considered

- **Shared `api_storage` volume between API and worker** — works only on one host and prevents
  scaling the API; this is what the first draft of ADR-0049 proposed.
- **MinIO** — Community Edition is source-only since October 2025 and the repository was
  archived in April 2026.
- **Garage or another S3 backend** — not evaluated; SeaweedFS passed every required operation,
  so no substitution was needed or authorised.
- **A stock GitHub Actions service container for CI** — cannot override the image command, and
  the default `mini` command takes no identity file, so it would not run the shipped
  configuration.
