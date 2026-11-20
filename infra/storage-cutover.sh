#!/usr/bin/env bash
# Moves production audio from the in-stack SeaweedFS to Cloudflare R2 (ADR-0072).
# Run on the production server from ~/bitrate; runbook: apps/docs/docs/infrastructure/deployment.md
# ("Object storage cutover to R2").
#
#   copy      copy SeaweedFS -> R2 while production keeps running; repeatable
#   verify    check that every SeaweedFS object is in R2 (size and checksum); changes nothing
#   final     stop api, worker and admin-api, copy the rest, verify every object
#   rollback  copy R2 -> SeaweedFS, for objects written to R2 after the switch
#
# The R2 target comes from the caller's shell, never from a file:
#   export R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
#   export R2_BUCKET=bitrate-audio R2_ACCESS_KEY=... R2_SECRET_KEY=...
# SeaweedFS is read with the S3 keys of the deployed ~/bitrate/.env.
set -euo pipefail

MODE="${1:-}"
cd "$(dirname "$0")/.."
ENV_FILE=.env
DC=(docker compose --env-file "$ENV_FILE" -f infra/docker-compose.prod.yaml)
RCLONE_IMAGE=rclone/rclone:1.69.1

case "$MODE" in
  copy|verify|final|rollback) ;;
  *) echo "usage: $0 copy|verify|final|rollback" >&2; exit 2 ;;
esac

for name in R2_ENDPOINT R2_BUCKET R2_ACCESS_KEY R2_SECRET_KEY; do
  [ -n "${!name:-}" ] || { echo "export $name first (see the header of this script)" >&2; exit 2; }
done

# Only the SeaweedFS identity is needed from the deploy file; read just those two names.
env_value() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2-; }
SW_ACCESS_KEY="$(env_value S3_ACCESS_KEY)"
SW_SECRET_KEY="$(env_value S3_SECRET_KEY)"
SW_BUCKET="$(env_value S3_BUCKET)"
SW_BUCKET="${SW_BUCKET:-bitrate-audio}"

SW_CONTAINER="${SW_CONTAINER:-bitrate-seaweedfs-prod}"
docker inspect "$SW_CONTAINER" >/dev/null 2>&1 || { echo "$SW_CONTAINER is not running" >&2; exit 1; }
NETWORK="$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{end}}' "$SW_CONTAINER")"

rclone() {
  docker run --rm --network "$NETWORK" \
    -e RCLONE_CONFIG_SW_TYPE=s3 -e RCLONE_CONFIG_SW_PROVIDER=SeaweedFS \
    -e RCLONE_CONFIG_SW_ENDPOINT=http://seaweedfs:8333 \
    -e RCLONE_CONFIG_SW_ACCESS_KEY_ID="$SW_ACCESS_KEY" -e RCLONE_CONFIG_SW_SECRET_ACCESS_KEY="$SW_SECRET_KEY" \
    -e RCLONE_CONFIG_SW_NO_CHECK_BUCKET=true \
    -e RCLONE_CONFIG_R2_TYPE=s3 -e RCLONE_CONFIG_R2_PROVIDER=Cloudflare \
    -e RCLONE_CONFIG_R2_ENDPOINT="$R2_ENDPOINT" -e RCLONE_CONFIG_R2_REGION=auto \
    -e RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true \
    -e RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY" -e RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_KEY" \
    "$RCLONE_IMAGE" "$@"
}

SRC="sw:${SW_BUCKET}"
DST="r2:${R2_BUCKET}"

case "$MODE" in
  copy)
    # `copy`, not `sync`: nothing in R2 is ever deleted by this script.
    rclone copy "$SRC" "$DST" --fast-list --transfers 8 --checkers 16 --stats 30s --stats-log-level NOTICE
    rclone size "$SRC" --fast-list
    rclone size "$DST" --fast-list
    echo "Copy done. Production still serves from SeaweedFS. Repeat any time; run 'final' at the switch."
    ;;
  verify)
    rclone check "$SRC" "$DST" --one-way --fast-list
    echo "Every SeaweedFS object is in R2."
    ;;
  final)
    echo "This stops api, worker and admin-api: production returns errors until the redeploy."
    echo "The worker finishes an active transcode first, which can take up to 11 minutes."
    read -r -p "Type 'cutover' to continue: " answer
    [ "$answer" = cutover ] || { echo "aborted"; exit 1; }
    "${DC[@]}" stop api worker admin-api
    rclone copy "$SRC" "$DST" --fast-list --transfers 8 --checkers 16 --stats 30s --stats-log-level NOTICE
    # Every source object must exist in R2 with the same size and checksum.
    rclone check "$SRC" "$DST" --one-way --fast-list
    cat <<'NEXT'

Every object is in R2. Now, in GitHub -> Settings -> Environments -> production:
  variables: S3_ENDPOINT=<R2 endpoint>, S3_REGION=auto, S3_BUCKET=<R2 bucket>
  secrets:   S3_ACCESS_KEY / S3_SECRET_KEY = the R2 application token
then run "[platform] Deploy Production" with mode=redeploy for the deployed tag.
The redeploy starts api, worker and admin-api on R2. SeaweedFS keeps its data as the rollback.
NEXT
    ;;
  rollback)
    # After the redeploy SeaweedFS runs with the R2 keys as its identity (it is configured from
    # the same S3_* values), so those keys reach both sides.
    rclone copy "$DST" "$SRC" --fast-list --transfers 8 --checkers 16 --stats 30s --stats-log-level NOTICE
    echo "R2 objects copied back. Unset S3_ENDPOINT/S3_REGION, restore the old S3 keys, redeploy."
    ;;
esac
