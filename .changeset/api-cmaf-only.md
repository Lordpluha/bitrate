---
'@bitrate/api': major
'@bitrate/contracts': major
---

Made CMAF the only stored audio format (ADR-0065). The worker now runs a single FFmpeg pass that
produces the CMAF renditions; the progressive Opus files and the HLS ladder are no longer encoded
or uploaded. Removed `GET /tracks/stream/:id`, `GET /tracks/stream/:id/hls/master.m3u8`,
`GET /tracks/stream/:id/hls/:bitrate/:asset`, the Socket.io `AudioGateway` with its WebSocket
guard and dependencies, and `playbackVersion` from tracks. A migration deletes non-CMAF track
files and attempts on the removed processing steps, marks ready tracks left without CMAF
renditions as failed, and makes the CMAF byte-index columns required.
