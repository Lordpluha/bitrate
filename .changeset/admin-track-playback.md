---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/admin': minor
---

Added `GET /admin/tracks/:id/audio` and `HEAD /admin/tracks/:id/audio`, staff-only endpoints (`tracks:read`) that stream a READY track's highest-bitrate CMAF rendition — or the one named by `?bitrate=` — for operator playback, honoring an inclusive `bytes=` Range with 200/206/416 responses. A taken-down (soft-deleted) READY track stays playable so an operator can review it before deciding whether to restore it; a track that is missing, not READY, or has no CMAF rendition at the requested bitrate returns 404. The `HEAD` route returns the same headers with no body and no storage round-trip, so a client can probe session/rendition availability before assigning `src`. The regenerated contract carries the new `/api/v1/admin/tracks/{id}/audio` path.

The operator panel's track detail page now plays a READY track, taken-down ones included, with a quality selector when several CMAF renditions exist. Playback never starts on its own, probes the session before assigning a source so an expired access token is refreshed first, and stops when the operator leaves the page.
