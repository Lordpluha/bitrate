---
'@bitrate/api': patch
---

Production deploys pull the images CI publishes instead of building them on the server.

Each app service now names its GHCR image alongside its build context, so `task prod:deploy`
fetches and restarts in a couple of minutes where a build on that box takes twenty-odd. `build:`
stays for local work and for the fallback `prod:build`.

The API image also drops six dead `ENV DATABASE_URL=$DATABASE_URL`-style lines. The `ARG` feeding
them was declared in the `base` stage, which later stages do not inherit, so each expanded to an
empty string — and the empty string is worse than nothing: compose passes `SHADOW_DATABASE_URL` by
bare name specifically so an unset variable stays absent, and the image was making it present. The
placeholder `postgresql://admin:admin@…` defaults went with them; they never reached the image, but
a credential-shaped default in a Dockerfile invites someone to start relying on it.
