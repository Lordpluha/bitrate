---
'@bitrate/player': minor
---

Added `streaming.renditionUrl`: without MSE, or once the CMAF loader fails, the streaming element
now plays the track's CMAF rendition file natively at the listener's pin or the adaptive
bitrate's opening rung. `source.progressiveUrl` became optional and, with `streaming.legacy`,
deprecated by ADR-0065; a track with neither a manifest nor a progressive file now stops with a
fatal error. Buffer thresholds were restated for 10-second fragments: an upgrade needs 20 s
buffered and the prefetched next track holds 10 s.
