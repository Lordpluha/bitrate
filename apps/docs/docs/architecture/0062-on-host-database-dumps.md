# ADR-0062: On-host database dumps until backups can leave the host

Status: Accepted

Date: 2026-10-19

## Context

Production has had no database backup since 2026-10-08, when the off-host automation of
[ADR-0033](./0033-off-host-backups-and-object-storage.md) was removed: it depended on a backup
bucket and credentials that were never provisioned, so it never completed a run. Since then a
deploy has run `prisma migrate deploy` against the only copy of the data, and a host-level
mistake (a dropped volume, a bad restore, a destructive query) had nothing to fall back to.

A scheduled GitHub workflow cannot fill the gap either. The `production` environment admits only
`master` and `v*` tags and asks a reviewer to approve every job, while a schedule always runs on
the default branch (`develop`), so a nightly job could never reach the deploy key.

## Decision

The server dumps its own database, with nothing new to provision:

- `task prod:backup` writes a `pg_dump -Fc` of the production database to `backups/prod/` on the
  host, under a temporary name renamed only when complete, and keeps the newest 14 dumps.
- `task prod:deploy` runs it before `prod:migrate`, so every migration has a copy taken right
  before it. It is skipped only when Postgres is not running yet (a first deploy).
- `task prod:deploy` also runs `prod:backup:schedule`, which installs one tagged crontab line
  for the deploy user: a nightly `prod:backup` at 03:17 UTC, logged to `backups/prod/cron.log`.
  The schedule therefore follows the deployed Taskfile and needs no runner, secret or approval.
- `task prod:restore FILE=…` restores a dump with `pg_restore --clean --if-exists`.

## Consequences

- Recoverable: a failed migration, an operator mistake, or corruption of the database itself.
- Not recoverable: losing the host or its disk takes the dumps with it. This is a stopgap, not
  the end state; off-host copies (ADR-0033's design) still need a bucket, credentials and an
  encryption key that someone has to provision.
- Audio in SeaweedFS is not covered, as before (ADR-0050).
- A failed nightly run is visible only in `cron.log` on the host; it raises no alert yet.
- Dumps take disk on the host; 14 custom-format dumps of today's database are small, but the
  retention count is the knob if that changes (`task prod:backup KEEP=…`).

## Alternatives considered

- **Revive ADR-0033's off-host workflow now** — blocked on the same unprovisioned bucket and
  credentials that got it removed.
- **A scheduled GitHub workflow over SSH** — cannot use the `production` environment from the
  default branch, and a second environment holding the deploy key would widen who can reach the
  host.
- **Volume snapshots** — not a consistent copy of a running Postgres.
