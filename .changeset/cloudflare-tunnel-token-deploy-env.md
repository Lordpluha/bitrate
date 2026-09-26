---
'@bitrate/api': patch
'@bitrate/admin': patch
'@bitrate/web-player': patch
'@bitrate/web-artists': patch
---

Fixed production deploys failing at `task prod:deploy` with `CLOUDFLARE_TUNNEL_TOKEN is missing
a value`. The `cloudflared` service in `infra/docker-compose.prod.yaml` has no profile gate, so
it is always part of the stack, but `deploy_reusable.yml`'s preflight and `.env`-rendering steps
never knew the name — even with the secret already set on the `production` environment, it was
never read or written into the rendered `.env`. Added `CLOUDFLARE_TUNNEL_TOKEN` to the required
variable list, both steps' `env:` mappings, and the render body.
