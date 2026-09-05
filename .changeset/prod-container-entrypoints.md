---
'@bitrate/api': major
'@bitrate/web-artists': major
---

Two container defects that only a real deployment could surface.

The API image started `apps/api/dist/main.js`, which does not exist. `env.schema.ts` and
`prisma.config.ts` live outside `src/` and the tsconfig sets no `rootDir`, so the compiler's
common root is the app directory and the entrypoint compiles to `dist/src/main.js`. The
package's own `start:prod` script already pointed there; only the Dockerfile did not, so the
container crash-looped with `MODULE_NOT_FOUND`.

The web-artists image kept web-player's `EXPOSE 3001` and health check against port 3001 in its
production stage, while the app starts on 3002. The container ran correctly and reported
unhealthy forever.
