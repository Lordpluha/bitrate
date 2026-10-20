---
'@bitrate/docs': patch
---

Removed the database backup tooling until backups are redone as separate work: the `prod:backup`,
`prod:backup:schedule`, `prod:restore`, `db:backup` and `db:restore` tasks, the backup step in
`prod:deploy`, the unused `backups` mount on the production postgres service, and ADR-0062. The
deployment guide now states that production has no automated backup. This also fixes the v0.5.0
production deploy, which failed because Docker had created the `backups` directory as root.
