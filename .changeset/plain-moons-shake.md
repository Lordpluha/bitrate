---
'@bitrate/web-artists': patch
'@bitrate/web-player': patch
'@bitrate/api': patch
'@bitrate/docs': patch
---

Pinned the vulnerable transitive dependencies flagged by Dependabot to their
patched releases through pnpm overrides, and moved Next.js to 16.2.11. The
affected packages reached the apps at runtime — multer, socket.io-parser, qs
and body-parser in the API, dompurify and mermaid in the docs site, next in
both web frontends — so this closes the advisories in shipped code rather
than in tooling alone.
