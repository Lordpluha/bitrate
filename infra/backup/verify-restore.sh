#!/bin/sh
# Prove the latest database backup restores: start a throwaway Postgres inside this pod,
# pg_restore the newest snapshot into it, sanity-check the result, then let restic verify
# a random sample of the repository's data. A backup that was never restored is not a
# backup.
#
# Runs in postgres:16-alpine as the postgres user (uid 70). Once the database needs
# extensions that plain postgres lacks (pgvector), this image must follow the server's.
set -eu

export RESTIC_REPOSITORY="s3:${BACKUP_S3_ENDPOINT}/${BACKUP_S3_BUCKET}/postgres"
export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_KEY"
export AWS_DEFAULT_REGION=auto
export RESTIC_CACHE_DIR=/work/restic-cache
restic() { /tools/restic -o s3.bucket-lookup=path --retry-lock 10m "$@"; }

PGDATA=/work/pgdata
SOCK=/work
# A Kubernetes run gets a fresh emptyDir; the compose service reuses /work between runs.
rm -rf "$PGDATA"
initdb -D "$PGDATA" -U verify --auth=trust >/dev/null
pg_ctl -D "$PGDATA" -o "-c listen_addresses='' -k $SOCK" -w start >/dev/null
trap 'pg_ctl -D "$PGDATA" -m fast stop >/dev/null 2>&1 || true' EXIT
createdb -h "$SOCK" -U verify restored

restic snapshots --host bitrate --tag postgres --latest 1
restic dump --host bitrate --tag postgres latest "/${POSTGRES_DB}.dump" \
  | pg_restore -h "$SOCK" -U verify -d restored --no-owner --no-privileges --exit-on-error

psql -h "$SOCK" -U verify -d restored -v ON_ERROR_STOP=1 -At <<'SQL'
\echo tables restored:
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
\echo migrations applied:
SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL;
SQL

TABLES="$(psql -h "$SOCK" -U verify -d restored -At -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")"
if [ "$TABLES" -lt 1 ]; then
  echo "restore produced no tables" >&2
  exit 1
fi

restic check --read-data-subset "${CHECK_DATA_SUBSET:-10%}"
echo "restore verified"
