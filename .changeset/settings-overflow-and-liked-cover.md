---
'@spotify/web-player': patch
---

Settings no longer stretch the page past the viewport. The avatar picker's
visually hidden file input is absolutely positioned, and with no positioned
ancestor it was laid out against the page root, escaping the app shell's
overflow clipping and leaving several thousand pixels of unpainted space below
the interface.

The Playback section drops the "Download the free app" promo, which advertised a
desktop app that does not exist and whose button had no behaviour.

Liked Songs uses a vector cover instead of a 48x48 JPEG that was being upscaled
roughly sixfold wherever it appeared.
