# Off-site backups (Cloudflare R2)

| CronJob | Schedule (UTC) | What it does |
|---|---|---|
| `backup-postgres` | every 6 h, `:15` | `pg_dump` → encrypted restic repository `r2:<bucket>/postgres`; keeps 4 latest, 7 daily, 4 weekly, 6 monthly |
| `backup-audio` | daily 03:45 | `rclone sync` of the SeaweedFS media bucket → `r2:<bucket>/audio/current`; removed objects move to `audio/deleted/<date>/` and expire after 30 days |
| `backup-verify` | Sundays 05:30 | restores the latest dump into a throwaway Postgres, sanity-checks it, `restic check` on 10% of the data |

The scripts live in `infra/backup/` (shared with other runtimes) and reach the pods through
the `backup-scripts` ConfigMap that `infra/backup/kustomization.yaml` generates.

The database repository is encrypted with `RESTIC_PASSWORD`. **Lose it and every database
backup is unreadable** — keep a copy in a password manager, never only on the server or in R2.
Audio is copied as-is into a private bucket (not encrypted).

## Set up R2

1. Cloudflare → R2 → create bucket `bitrate-backups` (location: automatic, private).
2. R2 → Manage API tokens → create token: *Object Read & Write*, *Apply to specific
   buckets only* → `bitrate-backups`. Note the access key, secret key and the S3 endpoint
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
3. `cp infra/k8s/backup/.env.example infra/k8s/backup/.env`, fill it in
   (`openssl rand -base64 32` for `RESTIC_PASSWORD`), store the password in a password manager.
4. `task k8s:backup:secret`, then run each job once:
   `task k8s:backup:run JOB=backup-postgres`, `JOB=backup-audio`, `JOB=backup-verify`.

Local cluster without R2: `task k8s:backup:local` points the jobs at an in-cluster S3
stand-in (`local-r2.yaml`, data is lost with its pod).

## Check status

```sh
kubectl -n bitrate get cronjobs                 # LAST SCHEDULE per job
kubectl -n bitrate get jobs -l batch.kubernetes.io/cronjob-name=backup-postgres
kubectl -n bitrate logs job/<job-name> --all-containers
```

Listing snapshots from a workstation needs the restic CLI and the values from `.env`:

```sh
set -a; . infra/k8s/backup/.env; set +a
export RESTIC_REPOSITORY="s3:$BACKUP_S3_ENDPOINT/$BACKUP_S3_BUCKET/postgres"
export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_KEY" AWS_DEFAULT_REGION=auto
restic -o s3.bucket-lookup=path snapshots
```

## Restore the database

Restoring replaces production data. Stop writers first so nothing lands between the dump
and the switch:

```sh
kubectl -n bitrate scale deployment api admin-api worker --replicas=0
```

With the restic variables from *Check status* exported (`latest` or a snapshot ID):

```sh
POD=postgres-0
restic -o s3.bucket-lookup=path dump latest /bitrate.dump > bitrate.dump
kubectl -n bitrate cp bitrate.dump $POD:/tmp/bitrate.dump
kubectl -n bitrate exec $POD -- sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --exit-on-error /tmp/bitrate.dump && rm /tmp/bitrate.dump'
kubectl -n bitrate scale deployment api admin-api worker --replicas=1
rm bitrate.dump
```

The dump file is the database in plain form: delete it from the workstation when done.

## Restore audio

Copy back from R2 into the media bucket (`copy` never deletes anything in the target):

```sh
rclone copy r2:bitrate-backups/audio/current seaweed:<S3_BUCKET> --transfers 8
# a file deleted by mistake on <date>:
rclone copy r2:bitrate-backups/audio/deleted/<date> seaweed:<S3_BUCKET>
```

`r2` and `seaweed` are rclone remotes (`rclone config`, provider `Cloudflare` / `SeaweedFS`);
for an in-cluster SeaweedFS, run rclone in a pod or `kubectl port-forward svc/seaweedfs 8333`.

## Known limits

- Up to 6 hours of database writes can be lost (the dump interval).
- A failed job only shows in `kubectl get jobs`; alerting on backup age comes with the
  observability move.
- `backup-verify` restores into plain `postgres:16-alpine`; once the database uses
  pgvector, its image must switch to the same image as the server.
