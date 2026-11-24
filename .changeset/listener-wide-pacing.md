---
'@bitrate/api': minor
---

Playback pacing now covered all of a listener's tracks together: they received no more than two
real-time streams plus a 150-second burst, so opening many sessions in parallel stopped speeding
up downloads. Opening play sessions was also throttled per user, and pacing continued in memory
while Redis was unreachable instead of stopping.
