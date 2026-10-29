# @bitrate/player

## 1.2.0

### Minor Changes

- f5c0dec: Added layout variants and composable parts. `<bitrate-player chrome="…">` now renders `bar` (the default, unchanged), `mini`, `expanded`, `floating` or `none`, and each layout shows only the controls it allows and the host has a callback for. Hosts can also build their own layout from new part elements (`bitrate-player-cover`, `-meta`, `-transport`, `-seek`, `-volume`, `-actions`, `-quality`, `-error`) that read the nearest player, with `controls` attributes to narrow their buttons. Sizes and colours are tunable through `--bitrate-player-*` custom properties and `::part()`.
- 7751fcc: Moved the CMAF/MSE playback path with adaptive bitrate from web-player into `@bitrate/player/engine`. The host now supplies the storage for remembered bandwidth and the debug default through `configureCmafEngine`; web-player plays exactly as before, now through the shared engine.
- c935ab5: The player now shows the playing track on the lock screen and in the OS media controls and answers the media keys (`media-session`), starts the next track just before the current one ends instead of after a gap, and lets listeners pick the stream quality or leave it on Auto, a pick that holds for the following tracks. In web-player the quality picker sits in the now-playing view, Shift+←/→ skips 10 seconds, L likes the track, Q opens the queue, + and − change the volume, and screen readers hear which track is now playing.
- 2da2be0: `<bitrate-player>` gained a streaming mode: with `streaming` set it plays `source` over the CMAF path with adaptive bitrate, falls back to the host's legacy adapter, prefetches `next` into a second media element and switches to it instantly, and reports `statechange`, `ended` (with the play key), `play`, `pause` and `error`. Hosts can now `seek()`, set `volume` and `muted`, read `state`, and point a second element at the first with `mirror` to render and control it. web-player now plays through this element instead of its own audio slots; playback behaves as before, and a play requested before the track had loaded no longer gets lost.
- 33e5f72: The player bar, the mobile island, the now-playing view and the floating window now all mirror the one `<bitrate-player>` that plays, so play, shuffle, repeat and seeking come from the same element everywhere. The bar, island and now-playing view keep their design, and Previous/Next keep their track previews. The floating window is now the element's `floating` layout, moved into the picture-in-picture window. `@bitrate/player` gained translatable `labels`, a `stacked` seek, theme variables for accent, Play button, rail, thumb and time, and optional `duration`/`startTime` on a source that are shown, and the start resumed, before the media loads. A host-composed element also keeps its content width in a flex row.

### Patch Changes

- 111ba2e: The floating layout now fills a picture-in-picture window and follows it when the window is resized, instead of keeping its minimum height. In streaming mode a track that plays to its end is reported only as `ended`, not also as a pause, so a host that mirrors play state no longer pauses the next track gapless already started, which had caused a gap and a flickering Play button at every track change.

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
