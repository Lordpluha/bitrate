---
"@bitrate/api": minor
---

Route the audio pipeline through `STORAGE_SERVICE`: uploads land in a temporary directory and are moved to storage as masters, `ConvertAudioJob` names the master by key (breaking: `inputPath` and `outputDir` are gone, and an unrecognised payload goes to the dead-letter queue), the consumer transcodes in a per-job scratch directory (`AUDIO_SCRATCH_ROOT`), and the S3 driver now returns signed API URLs instead of presigned object-store URLs.
