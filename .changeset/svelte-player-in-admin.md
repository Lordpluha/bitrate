---
'@bitrate/player': minor
'@bitrate/admin': minor
---

`@bitrate/player` now ships a real playback engine and `<bitrate-player>` UI — a shadow-DOM custom element with play/pause, seek, volume, mute, and a quality selector, driven by a framework-free engine that resolves a source lazily and never autoplays. The operator panel's track detail page replaces its native `<audio>` element with `<bitrate-player>`, resolving each play request through a `HEAD` probe so an expired session is refreshed before the audio source is assigned.

The element's chrome now matches `apps/web-player`'s bottom player bar — cover art, title/artist, token-styled transport and volume rails — and adapts to a compact layout at a narrow shadow-root width; optional transport controls (previous, next, shuffle, repeat, like, queue, picture-in-picture, expand) render only once a host supplies the matching callback property, so the operator panel keeps exactly today's play/seek/volume/quality surface.

Fixed: the compact layout no longer hides the quality selector or the volume control below the `36rem` container breakpoint — both stayed reachable only via hover, which made them unusable on a narrow/touch viewport. They now wrap onto their own row instead; only the total-duration readout shrinks away, keeping the elapsed time visible.
