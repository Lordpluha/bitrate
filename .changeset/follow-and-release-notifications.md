---
'@bitrate/api': minor
---

Notifications are now produced: following someone sends them a FOLLOW notification (once per unread follow), and a track's first publication sends a NEW_RELEASE notification to everyone following its artist. Both go through a BullMQ `notifications` queue, carry a structured `payload` for localized rendering, and never fail the follow or the conversion if the queue is down.
