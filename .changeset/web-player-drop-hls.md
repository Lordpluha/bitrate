---
'@bitrate/web-player': minor
---

Removed the hls.js fallback chain. Browsers without MSE, and plays whose CMAF loader fails, now
hear the track's CMAF rendition file natively through `<bitrate-player>`'s `renditionUrl`; the
player no longer receives a progressive file URL. A track without a manifest is reported as
unplayable instead of falling back to HLS.
