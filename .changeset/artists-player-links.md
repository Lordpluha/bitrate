---
'@bitrate/web-artists': patch
---

Links from the artists portal to a released album opened the Bitrate player at bitrate.me instead of `http://localhost:3001`. The production image was built without the player address and shipped the development fallback; a deployable build now refuses to start without real public addresses.
