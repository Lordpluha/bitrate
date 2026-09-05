---
'@bitrate/web-player': minor
---

Playback now opens at the quality the connection actually supports. Every track
previously started on the lowest rung and climbed, because each track built a
brand-new bandwidth estimate from zero — so even on fast connections the first
~20 seconds played at 128k. The measured estimate is now remembered across
tracks and reloads and picks the opening rendition, while a genuinely cold start
with nothing measured still opens low. A remembered estimate older than six
hours is discarded rather than trusted.
