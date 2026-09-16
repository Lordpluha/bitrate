---
'@bitrate/web-player': patch
'@bitrate/web-artists': patch
'@bitrate/api': patch
---

The three application production images shrank by between 35% and 94%. The web player now
builds with Next.js standalone output file tracing, so its image carries the traced server
instead of the whole hoisted production dependency tree, and its container runs `node
server.js` directly rather than two nested pnpm wrappers. Every production stage applies
ownership through `COPY --chown` instead of a trailing recursive `chown`, which had been
writing a second complete copy of the application tree into its own layer. The API image no
longer copies the seeded audio under `apps/api/storage/private`, keeping only the `public`
subtree its static file handler actually serves. Measured locally: web player 4.44 GB to
265 MB, API 3.88 GB to 1.9 GB, web artists 637 MB to 412 MB.
