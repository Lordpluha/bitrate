---
'@bitrate/api': patch
---

Build artifacts stay out of the Docker build context, which is the same defect as the env files and
had two visible effects.

`.dockerignore` listed `dist/`, `build/`, `.next/` and `out/` as root-relative patterns, so they
matched only the context root and left every app's and package's output in the context. A published
web-player image was carrying a `.next/dev/` tree — a development build inside a production image —
and every build shipped gigabytes to the daemon: the working tree measured 2.9 GB, of which
`apps/desktop/src-tauri/target` alone was 1.2 GB.

With `**/` prefixes and the Rust target directory excluded, a web-player build transfers 540 kB of
context instead, and the resulting image has no `.next/dev` at all. Verified by building it: the
client bundle contains `https://api.bitrate.me` and no `localhost:3000`.
