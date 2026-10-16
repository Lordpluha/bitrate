---
'@bitrate/web-player': patch
---

A play that fails to reach the listening history is retried after 30 seconds, at most three times, and not at all when the API refuses it for good. Before, the player retried on every playback tick and flooded the API until it answered 429.
