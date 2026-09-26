#!/bin/bash
# Produces the production backup artifacts on the server and prunes old local copies.
#
# This script deliberately holds NO credentials and performs NO upload. It runs on the
# VPS, writes into <project>/backups, and prints the paths it produced on stdout. Getting
# those files off the host is the caller's job — .github/workflows/backup_reusable.yml
# streams them to the runner over SSH and uploads from there, so the object-storage keys
# that can reach the backups never exist on the machine the backups protect.
#
# It is normally piped in rather than executed from a checkout:
#   ssh host 'cd "$HOME/bitrate" && bash -s -- --retention-days 7' < infra/backup.sh
# so it must not depend on its own path. The project directory is $PWD, or --project-dir.
#
# stdout is machine-readable (`db=<path>` / `storage=<path>`); every human-facing line
# goes to stderr, so the caller can parse one without filtering the other.

set -euo pipefail

PROJECT_DIR="${PWD}"
OUT_DIR=""
RETENTION_DAYS=7
INCLUDE_STORAGE=1

log() { printf '%s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
    cat >&2 <<'USAGE'
Usage: backup.sh [options]

  --project-dir DIR     Directory holding infra/ and .env  (default: $PWD)
  --out-dir DIR         Where to write the artifacts       (default: <project>/backups)
  --retention-days N    Delete local artifacts older than N days (default: 7, 0 disables)
  --no-storage          Skip the storage/ archive, dump the database only
  -h, --help            This message
USAGE
}

while [ $# -gt 0 ]; do
    case "$1" in
        --project-dir) PROJECT_DIR="${2:?--project-dir needs a value}"; shift 2 ;;
        --out-dir) OUT_DIR="${2:?--out-dir needs a value}"; shift 2 ;;
        --retention-days) RETENTION_DAYS="${2:?--retention-days needs a value}"; shift 2 ;;
        --no-storage) INCLUDE_STORAGE=0; shift ;;
        -h|--help) usage; exit 0 ;;
        *) usage; die "unknown argument: $1" ;;
    esac
done

case "${RETENTION_DAYS}" in
    ''|*[!0-9]*) die "--retention-days must be a non-negative integer, got: ${RETENTION_DAYS}" ;;
esac

cd "${PROJECT_DIR}" || die "cannot enter project directory: ${PROJECT_DIR}"
PROJECT_DIR="${PWD}"
[ -f infra/docker-compose.prod.yaml ] || die "no infra/docker-compose.prod.yaml under ${PROJECT_DIR} — is this the deploy directory?"
# Same reason Taskfile.yml's DC_PROD keeps --env-file: this compose file defaults nothing.
[ -f .env ] || die "no .env under ${PROJECT_DIR} — run the deploy workflow first, it renders that file"

[ -n "${OUT_DIR}" ] || OUT_DIR="${PROJECT_DIR}/backups"
mkdir -p "${OUT_DIR}"

DC=(docker compose --env-file .env -f infra/docker-compose.prod.yaml)

command -v docker >/dev/null 2>&1 || die "docker is not on this user's PATH"
"${DC[@]}" ps --status running --services 2>/dev/null | grep -qx postgres \
    || die "the postgres service is not running — nothing to dump"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DB_FILE="${OUT_DIR}/db-${STAMP}.dump"
DB_TMP="${DB_FILE}.partial"

# -Fc (custom format) rather than plain SQL: it is compressed, it carries a table of
# contents pg_restore can validate without a server, and it restores selectively. The
# credentials are read from the container's own environment, never hardcoded here — the
# same rule Taskfile.yml's db:* tasks follow, so overriding POSTGRES_USER/POSTGRES_DB in
# .env cannot silently break this.
#
# --no-owner/--no-privileges so the dump restores into any role, which is what makes the
# CI restore rehearsal possible at all.
log "==> Dumping the database to ${DB_FILE}"
umask 077
# The single quotes below are the point: POSTGRES_USER and POSTGRES_DB must be expanded by
# the shell inside the postgres container, from that container's own environment, not here.
# shellcheck disable=SC2016
if ! "${DC[@]}" exec -T postgres sh -c \
    'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-privileges' \
    > "${DB_TMP}"; then
    rm -f "${DB_TMP}"
    die "pg_dump failed — no backup was written"
fi

DB_BYTES="$(stat -c %s "${DB_TMP}")"
[ "${DB_BYTES}" -gt 0 ] || { rm -f "${DB_TMP}"; die "pg_dump produced an empty file"; }

# The dump is only useful if pg_restore can read its table of contents. infra/docker-compose.prod.yaml
# bind-mounts <project>/backups at /backups, so the postgres image's own pg_restore — always
# a version match for the server that wrote the dump — can check it in place. When the caller
# pointed --out-dir somewhere else that mount does not apply, and the real proof is the restore
# rehearsal in CI, so a missing mount warns rather than fails.
if [ "${OUT_DIR}" = "${PROJECT_DIR}/backups" ]; then
    if "${DC[@]}" exec -T postgres pg_restore --list "/backups/$(basename "${DB_TMP}")" >/dev/null 2>&1; then
        log "    table of contents verified by pg_restore --list"
    else
        rm -f "${DB_TMP}"
        die "pg_restore --list rejected the dump — it is truncated or corrupt, so it was discarded"
    fi
else
    log "    NOTE: --out-dir is outside the /backups mount, skipping the pg_restore --list check"
fi

# Rename last: a reader (the recency check in monitoring, a human) never sees a partial
# file under a name that looks finished.
mv -f "${DB_TMP}" "${DB_FILE}"
chmod 600 "${DB_FILE}"
log "    wrote ${DB_BYTES} bytes"

STORAGE_FILE=""
if [ "${INCLUDE_STORAGE}" -eq 1 ]; then
    # Uploaded masters, HLS ladders, covers and avatars. The API writes them under its own
    # working directory, /app/storage in the container, which infra/docker-compose.prod.yaml
    # keeps in the api_storage named volume. Reading it through the container rather than off
    # the host means this works for a named volume and a bind mount alike, and needs neither
    # the volume's generated name nor root.
    if ! "${DC[@]}" ps --status running --services 2>/dev/null | grep -qx api; then
        log "    WARNING: the api service is not running, so storage/ cannot be archived."
        log "    WARNING: the database dump above is complete; the uploads are NOT covered by this run."
    else
        STORAGE_FILE="${OUT_DIR}/storage-${STAMP}.tar.gz"
        STORAGE_TMP="${STORAGE_FILE}.partial"
        log "==> Archiving /app/storage to ${STORAGE_FILE}"
        if ! "${DC[@]}" exec -T api tar -czf - -C /app storage > "${STORAGE_TMP}"; then
            rm -f "${STORAGE_TMP}"
            die "tar failed while archiving /app/storage"
        fi
        STORAGE_BYTES="$(stat -c %s "${STORAGE_TMP}")"
        # An empty gzip stream is ~20 bytes. Anything at or below that is an empty storage
        # root, which on this deployment means the uploads are not persisted — either the
        # api_storage volume is not in effect yet, or nothing has been uploaded since it was.
        if [ "${STORAGE_BYTES}" -lt 200 ]; then
            rm -f "${STORAGE_TMP}"
            STORAGE_FILE=""
            log "    WARNING: /app/storage archived to ${STORAGE_BYTES} bytes — it is effectively empty."
            log "    WARNING: check that the api_storage volume is mounted; uploads may be living in the container layer."
        else
            mv -f "${STORAGE_TMP}" "${STORAGE_FILE}"
            chmod 600 "${STORAGE_FILE}"
            log "    wrote ${STORAGE_BYTES} bytes"
        fi
    fi
fi

if [ "${RETENTION_DAYS}" -gt 0 ]; then
    log "==> Pruning local artifacts older than ${RETENTION_DAYS} days"
    # Scoped to the names this script produces. A stray *.sql a human left in the directory
    # is theirs to remove; deleting files this script did not write is not its business.
    find "${OUT_DIR}" -maxdepth 1 -type f \
        \( -name 'db-*.dump' -o -name 'storage-*.tar.gz' -o -name '*.partial' \) \
        -mtime "+${RETENTION_DAYS}" -print -delete >&2 || true
fi

log "==> Local disk after this run:"
df -Ph "${OUT_DIR}" | tail -n1 >&2

printf 'db=%s\n' "${DB_FILE}"
[ -n "${STORAGE_FILE}" ] && printf 'storage=%s\n' "${STORAGE_FILE}"
exit 0
