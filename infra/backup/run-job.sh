#!/bin/sh
# Runs one backup script for compose-entrypoint.sh: loads the saved environment, sends the
# output to the container log, and on success records the time in /run/backup/ok-<job>, which
# the service healthcheck reads. One run of each job at a time.
set -u

JOB="$1"
STATE=/run/backup
LOG=/proc/1/fd/1
# shellcheck disable=SC1091
. "$STATE/env"

exec 9>"$STATE/lock-$JOB"
if ! flock -n 9; then
  echo "[$JOB] previous run still active, skipping" > "$LOG"
  exit 0
fi

echo "[$JOB] start $(date -u +%FT%TZ)" > "$LOG"
if [ "$JOB" = verify-restore ]; then
  # initdb refuses to run as root.
  su-exec postgres env HOME=/work sh "/scripts/$JOB.sh" > "$LOG" 2>&1
else
  sh "/scripts/$JOB.sh" > "$LOG" 2>&1
fi
status=$?

if [ "$status" -ne 0 ]; then
  echo "[$JOB] FAILED with exit code $status at $(date -u +%FT%TZ)" > "$LOG"
  exit "$status"
fi
date -u +%s > "$STATE/ok-$JOB"
echo "[$JOB] done $(date -u +%FT%TZ)" > "$LOG"
