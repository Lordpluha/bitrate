---
'@spotify/api': patch
---

Track durations stopped being invented. The seeder generated a random 180-300
second duration and used it to overwrite the real value that had already been
read from the audio file on upload, so every seeded track was wrong by up to
147 seconds in either direction, and instrumental versions inherited the main
track's duration. The seeder now leaves the file-derived duration alone, and
existing rows were recomputed from the CMAF fragment index.

Also removed a legacy seeded track that had no audio files at all and was stuck
in PROCESSING, and corrected a seeder log line that claimed to fall back to the
remote source URL when a download failed — no such fallback exists, the track is
skipped instead.
