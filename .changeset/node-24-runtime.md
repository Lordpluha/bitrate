---
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
'@bitrate/api': minor
'@bitrate/desktop': minor
'@bitrate/mobile': minor
'@bitrate/docs': minor
---

Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
the Node version CI already built and tested against. Previously CI ran on Node 24 while
each shipped container ran Node 22, so no pipeline exercised the runtime that actually
served traffic.
