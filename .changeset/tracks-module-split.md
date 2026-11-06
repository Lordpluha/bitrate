---
'@bitrate/api': patch
'@bitrate/contracts': patch
---

Split the API tracks module into `catalog/`, `ingest/`, `processing/`, `playback/` and `shared/`. `TrackUploadService` is replaced by `TrackIngestService`, `ReleaseTrackService` and `AudioConversionProducer`, and play sessions and CMAF delivery move to `TrackPlaybackController`. Routes, responses and queues are unchanged; in the contract only the two playback operation IDs are renamed (`TracksController_openPlaySession_v1` → `TrackPlaybackController_openPlaySession_v1`, `TracksController_streamRendition_v1` → `TrackPlaybackController_streamRendition_v1`).
