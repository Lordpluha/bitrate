#!/bin/sh
# Mirror the SeaweedFS media bucket into R2.
#
# Runs in rclone/rclone. `sync` is incremental: only new or changed objects are copied.
# Objects that disappeared from the source are not deleted in R2 but moved into
# audio/deleted/<date>/, so an accidental delete (or a bug that deletes) stays
# recoverable for DELETED_RETENTION_DAYS. Remotes are configured through env vars only,
# no rclone.conf.
set -eu

export RCLONE_CONFIG_SRC_TYPE=s3
export RCLONE_CONFIG_SRC_PROVIDER=SeaweedFS
export RCLONE_CONFIG_SRC_ENDPOINT="$S3_ENDPOINT"
export RCLONE_CONFIG_SRC_ACCESS_KEY_ID="$S3_ACCESS_KEY"
export RCLONE_CONFIG_SRC_SECRET_ACCESS_KEY="$S3_SECRET_KEY"

export RCLONE_CONFIG_DST_TYPE=s3
export RCLONE_CONFIG_DST_PROVIDER="${BACKUP_S3_PROVIDER:-Cloudflare}"
export RCLONE_CONFIG_DST_ENDPOINT="$BACKUP_S3_ENDPOINT"
export RCLONE_CONFIG_DST_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY"
export RCLONE_CONFIG_DST_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_KEY"
export RCLONE_CONFIG_DST_REGION=auto
# An R2 token scoped to one bucket may not call CreateBucket.
export RCLONE_CONFIG_DST_NO_CHECK_BUCKET=true

RETENTION_DAYS="${DELETED_RETENTION_DAYS:-30}"
BASE="dst:${BACKUP_S3_BUCKET}/audio"
TODAY="$(date -u +%F)"

rclone sync "src:${S3_BUCKET}" "${BASE}/current" \
  --backup-dir "${BASE}/deleted/${TODAY}" \
  --fast-list --transfers 4 --checkers 8 \
  --stats 1m --stats-log-level NOTICE

# Expire whole deleted/<date>/ folders by their name. Object timestamps cannot be used:
# a server-side move keeps the original modification time, so --min-age would purge a
# file the moment it was moved there.
CUTOFF="$(date -u -d "@$(( $(date +%s) - RETENTION_DAYS * 86400 ))" +%F)"
rclone lsf --dirs-only "${BASE}/deleted/" 2>/dev/null \
  | sed 's#/$##' \
  | awk -v cutoff="$CUTOFF" '$0 ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/ && $0 < cutoff' \
  | while read -r day; do
      echo "expiring ${BASE}/deleted/${day}"
      rclone purge "${BASE}/deleted/${day}"
    done

rclone size "${BASE}/current" --fast-list
