---
'@bitrate/api': patch
---

`docker-compose.prod.yaml`'s `api` service `environment:` list is an explicit allowlist —
`USER_WEB_HOST`/`ARTIST_WEB_HOST` were on it, `ADMIN_WEB_HOST` was not. Even with the variable
set on the `production` environment and rendered into `.env` by `deploy_reusable.yml`, the `api`
container never saw it: compose only passes through names this list names. Added
`ADMIN_WEB_HOST` to close the last gap in the admin-panel CORS fix.
