#!/bin/sh
# Entrypoint of the `backup` service in infra/docker-compose.prod.yaml: the same scripts the
# Kubernetes CronJobs run, scheduled by busybox crond inside postgres:16-alpine.
#
# crond starts jobs with an empty environment, so the container's environment is saved once
# to a root-only file that run-job.sh loads. The schedule matches infra/k8s/backup/cronjobs.yaml.
set -eu

STATE=/run/backup
mkdir -p "$STATE" /work
chmod 700 "$STATE"
chown postgres:postgres /work

# `export -p` quotes every value, so the file can be sourced back verbatim.
( umask 077; export -p > "$STATE/env" )

cat > /etc/crontabs/root <<'CRON'
15 */6 * * * sh /scripts/run-job.sh backup-postgres
45 3 * * *   sh /scripts/run-job.sh backup-audio
30 5 * * 0   sh /scripts/run-job.sh verify-restore
CRON

# One database backup right away: the healthcheck counts the age of the last good one, and a
# fresh container should not wait up to six hours to prove the setup works.
sh /scripts/run-job.sh backup-postgres &

exec crond -f -L /dev/stderr -c /etc/crontabs
