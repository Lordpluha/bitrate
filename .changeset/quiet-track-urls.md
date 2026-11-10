---
'@bitrate/web-player': patch
---

Track, album and playlist responses no longer required `audioUrl`, and the player stopped
rewriting it to the removed `/tracks/stream/:id` route; playback already went through play
sessions, so nothing changed for listeners.
