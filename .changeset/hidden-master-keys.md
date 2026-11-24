---
'@bitrate/api': major
'@bitrate/contracts': major
---

Public track responses stopped returning `audioUrl`, the master file's storage key. The Prisma
client omitted the column from every query unless it was selected explicitly, so no listener or
artist route could leak it, and `TrackEntity` in the public contract no longer listed it.
