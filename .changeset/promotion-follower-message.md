---
'@bitrate/api': minor
---

The "New release" notification of a whole release now carries the artist's follower message
from their promotion plan (`payload.artistMessage`, with `artistMessageAiGenerated` for the
"Created with AI" marker). It is included only when the artist approved or edited the message
before the release went live; otherwise the notification is unchanged.
