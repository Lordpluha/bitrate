---
'@bitrate/player': patch
---

The floating layout now fills a picture-in-picture window and follows it when the window is resized, instead of keeping its minimum height. In streaming mode a track that plays to its end is reported only as `ended`, not also as a pause, so a host that mirrors play state no longer pauses the next track gapless already started, which had caused a gap and a flickering Play button at every track change.
