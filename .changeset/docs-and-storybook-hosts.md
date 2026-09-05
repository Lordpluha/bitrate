---
'@bitrate/docs': minor
'@bitrate/ui-react': minor
'@bitrate/web-player': patch
---

The documentation site and Storybook get their own hosts: `docs.bitrate.me` and `ui.bitrate.me`.

Both are prebuilt static bundles served by nginx inside their own container, sharing
`infra/nginx/static-site.conf`. They listen on 8080 rather than 80 because they run as the
unprivileged `nginx` user, which cannot bind a port below 1024 — the previous docs image asked for
port 80 under `USER nginx` and could never have started. Its server config was also assembled by
an `echo` with line continuations inside single quotes, which writes the backslashes into the file
for nginx to reject; it is a real file now.

`packages/ui-react` gained a `build-storybook` script and an image. The library build has to run
first: the svgr plugin generates `src/icons/svgr/` during it and the stories import from there.

The edge nginx routes both through one shared snippet that takes its backend from a
`$static_upstream` variable set in each server block — a variable rather than a literal, so a
recreated container with a new address does not serve 502 until nginx restarts.

The service worker's cache version is bumped to v3. `/icon.svg` kept its path through the logo
replacement, so every client that had already installed v2 went on serving the old mark from its
precache — the network copy is only consulted after a version change clears it.
