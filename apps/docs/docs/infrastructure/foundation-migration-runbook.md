# Backend foundation migration runbook

The `20260811120000_backend_platform_foundation` migration is a **maintenance-window
migration**, not a rolling-deploy migration. It replaces Prisma implicit relation tables,
backfills ordered relation rows, installs `pg_trgm`, and builds GIN indexes. Do not run it
while an old or new API binary is accepting writes.

## Release policy

1. Rehearse on a recent sanitized production-size snapshot. Record duration, peak WAL,
   temporary disk use, and lock wait time.
2. Verify that the deployment role can run `CREATE EXTENSION IF NOT EXISTS pg_trgm` before
   the maintenance window. If production policy requires a DBA-owned extension, install it
   separately and verify `SELECT extversion FROM pg_extension WHERE extname = 'pg_trgm'`.
3. Stop API workers and queue consumers, then verify that no application sessions remain.
   Web clients must receive the normal maintenance response during this period.
4. Take and verify a restorable database backup. Record the backup identifier and the
   pre-deploy application image digest.
5. Run `pnpm --filter @spotify/api db:migration:deploy` exactly once. The migration is one
   transaction with a 10-second lock timeout and a 15-minute statement timeout; any failed
   assertion rolls the complete migration back.
6. Run the verification queries below before starting the new binary.
7. Deploy the new API and workers, run auth/catalog/playback smoke tests, then reopen traffic.

Never edit this migration after it has been applied to a shared environment. If its checksum
is already registered in `_prisma_migrations`, ship corrections as a new migration.

## Required verification

```sql
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
WHERE migration_name = '20260811120000_backend_platform_foundation';

SELECT COUNT(*) AS user_sessions_without_expiry
FROM "UserSession" WHERE "expiresAt" IS NULL;

SELECT COUNT(*) AS artist_sessions_without_expiry
FROM "ArtistSession" WHERE "expiresAt" IS NULL;

SELECT COUNT(*) AS playlist_position_duplicates
FROM (
  SELECT "playlistId", position
  FROM "PlaylistTrack"
  GROUP BY "playlistId", position
  HAVING COUNT(*) > 1
) duplicates;

SELECT COUNT(*) AS album_number_duplicates
FROM (
  SELECT "albumId", "discNumber", "trackNumber"
  FROM "AlbumTrack"
  GROUP BY "albumId", "discNumber", "trackNumber"
  HAVING COUNT(*) > 1
) duplicates;

SELECT COUNT(*) AS orphan_playlist_tracks
FROM "PlaylistTrack" relation
LEFT JOIN "Playlist" playlist ON playlist.id = relation."playlistId"
LEFT JOIN "Track" track ON track.id = relation."trackId"
WHERE playlist.id IS NULL OR track.id IS NULL;

SELECT COUNT(*) AS orphan_album_tracks
FROM "AlbumTrack" relation
LEFT JOIN "Album" album ON album.id = relation."albumId"
LEFT JOIN "Track" track ON track.id = relation."trackId"
WHERE album.id IS NULL OR track.id IS NULL;
```

Every count above must be zero. Also compare catalog, liked-library, playlist, and album
counts against the rehearsal report and sample ordering for ambiguous legacy relations.
Legacy implicit relations did not contain product ordering, so the backfill creates a
deterministic synthetic order; it must not be described as restored historical order.

## Session policy

Legacy session rows with no expiry are assigned `createdAt + 30 days`. Rows already older
than that become expired immediately and are intentionally rejected by the guards. The
session-list API and authentication guards both use the persisted expiry. Communicate this
bounded forced logout before the maintenance window.

## Failure and recovery

- Before commit, PostgreSQL rolls the transaction back. Correct the preflight, capacity, or
  data problem and rerun `prisma migrate deploy`; do not mark a failed migration as applied.
- If smoke tests fail after commit but data verification passes, roll the application image
  forward with a code fix. The previous binary is not compatible with the contracted schema.
- If verification shows corrupt data, keep traffic closed and restore the recorded backup.
  Do not attempt an ad-hoc reverse migration after the implicit tables have been dropped.

Long-term zero-downtime rollout requires a separate expand/dual-write/backfill/contract
sequence. That is a different deployment design and must be completed before this service is
run with multiple API versions concurrently.
