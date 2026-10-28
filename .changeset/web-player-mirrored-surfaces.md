---
'@bitrate/player': minor
'@bitrate/web-player': minor
---

The player bar, the mobile island, the now-playing view and the floating window now all mirror the one `<bitrate-player>` that plays, so play, shuffle, repeat and seeking come from the same element everywhere. The bar, island and now-playing view keep their design, and Previous/Next keep their track previews. The floating window is now the element's `floating` layout, moved into the picture-in-picture window. `@bitrate/player` gained translatable `labels`, a `stacked` seek, theme variables for accent, Play button, rail, thumb and time, and optional `duration`/`startTime` on a source that are shown, and the start resumed, before the media loads. A host-composed element also keeps its content width in a flex row.
