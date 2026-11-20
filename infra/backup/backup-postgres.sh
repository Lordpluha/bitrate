#!/bin/sh
# Dump the database into the encrypted restic repository in R2, then apply retention.
#
# Runs in postgres:16-alpine (pg_dump must be at least the server's major version); the
# restic binary is copied into /tools by an init container. The dump is custom format
# without compression (-Z0) so restic can deduplicate one run against the next and
# compress the result itself; the repository is encrypted with RESTIC_PASSWORD.
set -eu

export RESTIC_REPOSITORY="s3:${BACKUP_S3_ENDPOINT}/${BACKUP_S3_BUCKET}/postgres"
export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_KEY"
export AWS_DEFAULT_REGION=auto
export PGPASSWORD="$POSTGRES_PASSWORD"
restic() { /tools/restic -o s3.bucket-lookup=path --retry-lock 10m "$@"; }

if ! restic cat config >/dev/null 2>&1; then
  echo "initialising restic repository at $RESTIC_REPOSITORY"
  restic init
fi

# --stdin-from-command fails the snapshot when pg_dump exits non-zero, so a broken dump
# never becomes the "latest" snapshot. --host is fixed because pod names change every run
# and retention groups snapshots by host.
restic backup \
  --host bitrate --tag postgres \
  --stdin-filename "${POSTGRES_DB}.dump" \
  --stdin-from-command -- \
  pg_dump -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -Z0

# Every 6 hours: the last day in full, then one per day / week / month.
restic forget --host bitrate --tag postgres \
  --keep-last 4 --keep-daily 7 --keep-weekly 4 --keep-monthly 6 \
  --prune

restic snapshots --host bitrate --tag postgres --latest 1
