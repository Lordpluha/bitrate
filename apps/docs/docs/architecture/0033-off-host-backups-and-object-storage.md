# ADR-0033: Backups leave the host, and the audio moves to object storage

Status: Accepted

Date: 2026-09-08

## Context

Production ran with three defects that only appear together in the exact failure a backup
exists for — losing the machine.

**1. Nothing wrote a production database dump.** `Taskfile.yml` described `task prod:backup`
in the `db:backup` description, and
[the tech roadmap](../strategy/tech-roadmap.md) described what it did. The task did not exist
in any revision. `infra/docker-compose.prod.yaml` bind-mounted `../backups:/backups` on the
postgres service and `.github/workflows/monitoring_backup_reusable.yml` checked that a recent
file was in that directory, so the mechanism around the backup was complete and the backup was
absent from the middle of it.

**2. Where the dumps would have gone was the disk they protect.** `BACKUP_DIR` defaults to
`${DEPLOY_PATH}/backups` on the production host. No `aws s3 cp`, no `rclone`, no off-host
rsync existed in the Taskfile or in any workflow. A copy on the machine is a copy, not a
backup: the disk failure, the accidental `docker system prune -af`, and the compromised host
each take the database and every dump of it in one event.

**3. No restore had ever been performed.** The monitoring check asserted that the newest file
was recent and non-empty. That distinguishes "a file exists" from "no file exists". It cannot
distinguish a good dump from one `pg_dump` truncated halfway through, from a schema-only dump,
or from a dump of the wrong database — all three of which pass a size-and-age test.

And a fourth, found while fixing the first three, which is worse than any of them:

**4. Uploaded audio was not merely un-backed-up, it was not persisted at all.** The API's
production entrypoint is `node apps/api/dist/src/main.js` from `WORKDIR /app`, so
`process.cwd()` is `/app`, and
[`storage.config.ts`](../applications/api/overview.md) resolves every upload path under
`/app/storage`. `infra/docker-compose.prod.yaml` mounted `../apps/api/uploads` and
`../apps/api/public` — two paths nothing in the API has ever written to, whose empty host
directories Docker created on first run, which is why they looked like they held the uploads.
`/app/storage` was mounted nowhere. Every uploaded master, HLS ladder, cover and avatar lived
in the container's writable layer and was destroyed by the next `docker compose up -d` that
recreated the container, which is to say by the next deploy.

So "back up the uploads directory" would have faithfully archived nothing.

## Decision

### Database backups leave the host, and the credentials never arrive on it

`infra/backup.sh` runs on the server, dumps the database with `pg_dump --format=custom` reading
`POSTGRES_USER`/`POSTGRES_DB` from the postgres container's own environment, validates the
result with `pg_restore --list` before it is renamed into place, prunes local copies by age,
and prints the paths it produced. It holds no credentials and uploads nothing.

`.github/workflows/backup.yml` runs daily, streams those files to the runner over SSH,
checksums both ends, and uploads to S3-compatible object storage **from the runner**.

The split is the point. The object-storage keys that can write — and, if pruning were enabled,
delete — the backups exist only in GitHub. A production host that is lost, wiped, or
compromised cannot reach the copies that survive it. Retention in the bucket is a lifecycle
rule set on the bucket, so the workflow's credential needs no `DeleteObject` at all;
`prune-remote` exists for a provider without lifecycle support and is off.

Vendor-agnostic by construction: endpoint, bucket, region and prefix are configuration, and
`AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED` keeps the uploads portable across R2, B2,
Wasabi, Hetzner and MinIO. That setting is not honoured on the `aws s3 cp` path in AWS CLI v2,
which is why every upload uses `aws s3api put-object`.

### A restore rehearsal, not a file-exists check

`.github/workflows/monitoring_restore_reusable.yml` runs on the existing monitoring schedule.
It takes the newest object **out of the bucket** — the copy that will still exist in the
disaster — restores it into a throwaway Postgres of the same major version, and asserts on the
result: the expected tables exist, `_prisma_migrations` holds an applied migration, and
`"User"` holds at least `min-user-rows` rows. A truncated dump fails at `pg_restore`; a
schema-only or wrong-database dump fails at the row assertions. Both were verified against a
real dump before the workflow was committed.

The old on-server recency check is kept. It answers a different question — is the server still
producing dumps — and it answers it in seconds.

### The audio moves to object storage; the local tree is persisted and backed up meanwhile

`STORAGE_DRIVER=s3` is the durable answer for uploaded audio, and it is available today:
`S3Service` implements every method of the `StorageService` interface that `LocalStorageService`
does, and the driver is selected at boot by one environment variable. Object storage gives the
audio replication and durability guarantees no VPS disk offers, and it removes the
single-host pin recorded in the tech roadmap — the API stops being the only process that can
serve a given byte.

That does not make the local tree unnecessary, and this is the part that is easy to get wrong:
**switching the driver moves only what goes through `StorageService`** — the transcoded audio
and HLS artifacts written by `audio-artifact-storage.ts`. Track covers, artist avatars and
backgrounds are written straight to `./storage/public/...` by multer and served by
`ServeStaticModule`; they never touch the storage driver and stay on the filesystem whatever
`STORAGE_DRIVER` says.

So both, deliberately:

- `infra/docker-compose.prod.yaml` mounts the `api_storage` named volume at `/app/storage`, and
  `apps/api/Dockerfile` creates that directory so Docker seeds the volume with the non-root
  user's ownership and no `chown` is needed on the host. This is what makes uploads survive a
  deploy at all.
- `infra/backup.sh` archives that volume through the api container
  (`tar -czf - -C /app storage`), so it works for a named volume and a bind mount alike, and
  ships it off-host beside the database dump.
- The audio then migrates to the bucket, and the storage archive narrows to what remains.

## Consequences

**Mandatory, and in this order.** The uploads currently live in a container that the next
deploy destroys. `task prod:storage:rescue` must be run on the server *before* the deploy that
lands the `api_storage` volume, and `task prod:storage:seed FILE=…` after it. Deploying first
loses them; there is no second chance and no copy anywhere.

**Migration path for the files already on disk.** The local driver's root is
`storage/private/objects`, and a key maps 1:1 to a path under it — the same way `S3Service`
treats a key as a path within its bucket. So the migration is a prefix-preserving copy of that
subtree into the media bucket, after which `STORAGE_DRIVER=s3` and the four `S3_*` values are
set on the production environment and the API is restarted. `env.schema.ts` requires
`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY` and `S3_SECRET_KEY` when the driver is `s3` and
fails at startup without them, so a half-configured switch cannot serve traffic.

**The media bucket is not the backup bucket.** Separate buckets and separate credentials: the
application key can delete track objects by design, and a key that can delete track objects
must not be able to delete the backups of them.

**Found and not fixed here, because it is application code.** `ServeStaticModule` in
`app.module.ts` roots at `join(__dirname, '..', '..', 'storage', 'public')`, which resolves to
`/app/apps/api/storage/public` — the seed tree copied in by the Dockerfile — while multer writes
new covers and avatars to `/app/storage/public`. In production the two disagree, so a newly
uploaded cover is stored in one place and served from another. In development they coincide,
which is why it has never been visible. It needs a fix in `apps/api`, and the storage volume
does not paper over it.

**Still open.** The database dump is uploaded in a single `put-object` request, which S3 caps
at 5 GiB; the workflow fails by name rather than storing a partial object, and switching to a
multipart upload is the follow-up when that day comes. Point-in-time recovery is not addressed —
a daily dump means up to 24 hours of loss, and WAL archiving is the answer if that window ever
becomes unacceptable.

## Alternatives considered

- **Back up the `uploads` directory as it stood.** It would have archived an empty directory
  Docker created for a bind mount the API never writes to. The reason this looked like a
  reasonable option is the same reason it was never noticed: the mount existed and the
  directory was there.
- **Push to object storage from the server.** Simpler, one hop instead of two, and it keeps
  working when GitHub is down. Rejected because it requires the write credential to live on the
  host, so an attacker who takes the machine can destroy or poison the off-host copies too —
  which removes most of the value of having them off-host.
- **A cron job on the server instead of a scheduled workflow.** Nothing reports a cron job that
  silently stopped. A workflow run that fails is visible in the same place as every other
  failure, and `infra/backup.sh` remains runnable by hand or from cron as a fallback.
- **Bucket versioning instead of a restore rehearsal.** Versioning protects against
  overwriting a good backup with a bad one. It says nothing about whether any version restores,
  which is the claim that has never been tested.
- **Keep the audio on the filesystem with a persistent volume and off-host archives only.**
  Workable, and it is what runs until the migration happens. Rejected as the end state: a
  nightly tar of a growing media tree scales badly, and it leaves the API pinned to one host.
