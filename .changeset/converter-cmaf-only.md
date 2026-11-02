---
'@bitrate/converter': major
---

CMAF renditions now default to 469-frame fragments (10.005 s at 48 kHz) instead of 192 frames
(4.096 s), per ADR-0065. Removed `convertAudio` (Ogg Opus), `convertAudioToHls`, the `./audio`
and `./hls` subpath exports and the CLI's `audio` command; nothing streams those formats any more.
