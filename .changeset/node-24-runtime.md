---
'@spotify/web-player': minor
'@spotify/web-artists': minor
'@spotify/api': minor
'@spotify/admin': minor
'@spotify/desktop': minor
'@spotify/mobile': minor
'@spotify/docs': minor
---

Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
the Node version CI already built and tested against. Previously CI ran on Node 24 while
each shipped container ran Node 22, so no pipeline exercised the runtime that actually
served traffic.
