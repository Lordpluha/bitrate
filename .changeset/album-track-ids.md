---
'@spotify/api': patch
---

Album endpoints returned the `AlbumTrack` join-row id in place of the track's
own id, because the membership row was spread over the track and its `id` won.
Every track started from an album page therefore asked the playback endpoints
for a non-existent id and failed with a 404 on both the CMAF manifest and the
HLS fallback. The flattening now drops the join row's id while still letting the
album-specific `trackNumber`/`discNumber` override the track's own.
