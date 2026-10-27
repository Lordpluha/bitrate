---
'@bitrate/player': minor
'@bitrate/web-player': patch
---

Moved the CMAF/MSE playback path with adaptive bitrate from web-player into `@bitrate/player/engine`. The host now supplies the storage for remembered bandwidth and the debug default through `configureCmafEngine`; web-player plays exactly as before, now through the shared engine.
