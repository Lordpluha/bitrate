# ADR-0072: Cloudflare R2 for production object storage and off-site backups

Status: Accepted

Date: 2026-11-20

Supersedes, for production only, the storage backend of
[ADR-0050](./0050-seaweedfs-object-storage-for-audio.md) and closes its accepted risk "no bucket
backups". Local development and CI keep SeaweedFS as ADR-0050 describes.

## Context

Production audio lives in a single-node SeaweedFS on the one application server, with no off-host
copy (ADR-0050 accepted that until real content arrived; it has). The database has had no
automated backup since ADR-0033's design was removed. The production availability target is
99.5% (about 3.6 hours of downtime a month), so a single server is acceptable — losing data is
not. The owner does not want to rent additional servers.

The API reaches storage only through `S3Service` with basic operations (Put, Get with Range,
Head, Delete, DeleteObjects, ListObjectsV2, HeadBucket) and never hands a browser a storage URL
(signed API token URLs, epic decision D16), so any S3-compatible service can replace SeaweedFS
without code changes.

## Decision

1. **Production audio moves to Cloudflare R2**, bucket `bitrate-audio`, reached with an R2 API
   token scoped to that bucket (Object Read & Write). The switch is configuration:
   `S3_ENDPOINT` (the account's `https://<account>.r2.cloudflarestorage.com`) and
   `S3_REGION=auto` as GitHub environment variables, the token as `S3_ACCESS_KEY` /
   `S3_SECRET_KEY`. Unset `S3_ENDPOINT` keeps the in-stack SeaweedFS, so the release that ships
   this change does not move production by itself.
2. **SeaweedFS stays in the production stack until the cutover is complete**, holding its data as
   the rollback path; a later release removes the service and its volume.
3. **Off-site backups to a second R2 bucket**, `bitrate-backups`, written with a separate token
   that the application never receives, so a leaked application key cannot erase backups:
   - PostgreSQL: `pg_dump` every 6 hours into a restic repository (encrypted with
     `RESTIC_PASSWORD`, deduplicated), retention 4 latest / 7 daily / 4 weekly / 6 monthly.
   - Audio: daily `rclone sync` of `bitrate-audio`; objects removed from the source move to
     `audio/deleted/<date>/` and expire after 30 days.
   - Weekly restore check: the latest dump is restored into a throwaway Postgres and a sample of
     the repository is verified.
4. **One set of scripts for every runtime** (`infra/backup/`): the compose `backup` service runs
   them with crond, the Kubernetes CronJobs (`infra/k8s/backup/`) mount them from a ConfigMap. The
   compose service is enabled by the deploy workflow (`COMPOSE_PROFILES=backup`) only when all
   backup settings are present; a partial set fails the deploy preflight.
5. **Cutover** with `infra/storage-cutover.sh`: copy while production runs, then stop the API
   processes, copy the remainder, verify every object, switch the variables and redeploy.

## Consequences

- Audio survives the loss of the server. Storage now depends on the network: every streamed
  segment is a request from the server to R2, adding tens of milliseconds per request compared
  with a local store.
- Cost: R2 has no egress fees; the free tier covers 10 GB-month storage, 1 million Class A and
  10 million Class B operations a month. Streaming is Class B (one read per segment).
- The audio and its backup share one Cloudflare account. The backup protects against application
  bugs, accidental deletes and a leaked application key, not against losing the account. Accepted.
- Up to 6 hours of database writes can be lost (the dump interval).
- New deploy configuration: variables `S3_ENDPOINT`, `S3_REGION`, `BACKUP_S3_ENDPOINT`,
  `BACKUP_S3_BUCKET`; secrets `BACKUP_S3_ACCESS_KEY`, `BACKUP_S3_SECRET_KEY`, `RESTIC_PASSWORD`.
  Losing `RESTIC_PASSWORD` makes every database backup unreadable; it is kept outside the server
  and outside R2.
- The R2 keys also configure SeaweedFS while it remains (it builds its identity from the same
  `S3_*` values). R2 keys are hexadecimal, so the deploy preflight's letters-and-digits rule for
  that identity file still holds.
- Before the switch, `apps/api/src/infra/s3/s3.service.int-spec.ts` must pass against R2 (the
  ADR-0050 spike suite). Recent AWS SDK versions send checksums by default; if R2 rejects any
  request shape, `S3Service` is fixed before the cutover, not after.

## Alternatives considered

- **Google Drive for backups** — personal accounts need an OAuth token that expires after seven
  days unless the OAuth app is published, service accounts have no My Drive quota, and it is not
  an S3 API; R2 is S3-compatible and needs only a scoped token.
- **Keep SeaweedFS and back it up to R2** — still loses availability with the server and keeps a
  1G service on an 8 GB host; R2 as primary storage removes both.
- **A mirror of the audio on the server's own disk** — protects against losing the Cloudflare
  account, but costs disk on an 8 GB host and does not survive losing the server.
