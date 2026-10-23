# @bitrate/player

## 1.1.1

### Patch Changes

- e97e6c7: A code-health pass fixed bugs found in review and removed duplicated and wasteful work across
  the stack. The API created OAuth accounts atomically, deleted replaced avatars, closed storage
  streams on failure, kept muted notification categories from crowding out releases, reported
  playlist position races as conflicts and re-checked websocket sessions on a timer instead of on
  every message, with narrower reads and shared admin take-down, OAuth and ranking helpers. The
  landing page gave every scene its own particle layout again and stopped per-frame style reads;
  the player stopped rewriting the store on every progress tick and mutation errors were toasted
  once. The admin panel told load failures apart from missing records and kept the page when
  navigating search history; the artist dashboard themed its verify-email page and refreshed only
  the caches a release write changed. The carousel released its re-init listener and honoured
  consumer gaps, the player engine ignored superseded play requests, and the MP4 indexer and SVG
  colour detection did less work per file.

## 1.1.0

### Minor Changes

- e9d556d: `@bitrate/player` now ships a real playback engine and `<bitrate-player>` UI — a shadow-DOM custom element with play/pause, seek, volume, mute, and a quality selector, driven by a framework-free engine that resolves a source lazily and never autoplays. The operator panel's track detail page replaces its native `<audio>` element with `<bitrate-player>`, resolving each play request through a `HEAD` probe so an expired session is refreshed before the audio source is assigned.

  The element's chrome now matches `apps/web-player`'s bottom player bar — cover art, title/artist, token-styled transport and volume rails — and adapts to a compact layout at a narrow shadow-root width; optional transport controls (previous, next, shuffle, repeat, like, queue, picture-in-picture, expand) render only once a host supplies the matching callback property, so the operator panel keeps exactly today's play/seek/volume/quality surface.

  Fixed: the compact layout no longer hides the quality selector or the volume control below the `36rem` container breakpoint — both stayed reachable only via hover, which made them unusable on a narrow/touch viewport. They now wrap onto their own row instead; only the total-duration readout shrinks away, keeping the elapsed time visible.
