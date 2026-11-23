---
'@bitrate/support-core': minor
---

Added `@bitrate/support-core/client`: a browser client of the support chat API that starts and loads conversations and reads the streamed reply (Server-Sent Events from a `fetch` body) into typed events. Malformed frames are skipped. The web apps share it.
