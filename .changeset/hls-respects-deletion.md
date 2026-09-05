---
'@bitrate/api': patch
---

Deleting a track now actually stops it streaming. Both HLS entry points — the
master playlist and the per-rendition assets — read the track without checking
`deletedAt`, and the asset route checked no track state at all, so a soft-deleted
track kept serving its full audio indefinitely while every other read path in the
module filtered it out.

Uploading a track no longer records a `TrackFile` row pointing at a bare multer
filename rather than a storage key. That row survived publication, so a later
progressive request for the source format resolved a path that does not exist and
returned 404 for a perfectly healthy track. The `format` query parameter is now
restricted to the supported progressive formats instead of accepting any string.

Ranged responses omit `Content-Length` when the storage driver does not report
one, instead of sending `0` or the literal text `undefined` alongside a non-empty
body. Liking an already-liked playlist, or registering a device twice
concurrently, now returns 409 instead of a generic 500.
