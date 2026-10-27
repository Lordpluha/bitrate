---
'@bitrate/player': minor
'@bitrate/web-player': patch
---

`<bitrate-player>` gained a streaming mode: with `streaming` set it plays `source` over the CMAF path with adaptive bitrate, falls back to the host's legacy adapter, prefetches `next` into a second media element and switches to it instantly, and reports `statechange`, `ended` (with the play key), `play`, `pause` and `error`. Hosts can now `seek()`, set `volume` and `muted`, read `state`, and point a second element at the first with `mirror` to render and control it. web-player now plays through this element instead of its own audio slots; playback behaves as before, and a play requested before the track had loaded no longer gets lost.
