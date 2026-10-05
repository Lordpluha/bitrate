# Migration checks

`artist-release-foundation.sql` exercises the release migration's database constraints and
preservation of existing recordings. Run it only on a **disposable, otherwise empty test
database** after applying the schema and migration. It rolls its fixtures back and fails
on unexpected constraint behavior.

```sh
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/api/test/migrations/artist-release-foundation.sql
```

For the initial verification, the pre-change Prisma schema was converted to SQL using
`prisma migrate diff --from-empty --to-schema ... --script`, applied to a fresh PostgreSQL 16
cluster in `/tmp`, followed by `20261001120000_artist_release_foundation/migration.sql` and
this check. The server used a private Unix socket, a 300-second timeout and was stopped
immediately after verification. No existing application database was used.

`release-rights-submission.sql` covers `20261005120000_release_rights_submission`: UPC/ISRC
storage formats, ISRC uniqueness and the master-owner name rule. Check digits and partner rules
are enforced by the API, not the database.

These checks verify storage invariants. The future release API still needs transactional
split-total, identifier, territory and track-ownership validation before exposing submission.
