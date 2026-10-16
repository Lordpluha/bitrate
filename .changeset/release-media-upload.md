---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-artists': minor
---

Add artwork and master audio uploads to owned release drafts. Artists upload, replace and
remove the cover (JPEG, PNG or WebP up to 20 MB, checked against its content) and add
recordings from a WAV, FLAC, MP3 or OGG master up to 512 MB, which is stored privately in
the object store and played back only by its owner. Recordings can be renamed, have their
master replaced or be removed, which also deletes the stored file and frees the ISRC.
Adding, replacing or removing audio clears the accuracy confirmation. Submission now also
requires artwork and uploaded audio for every draft recording. Nothing is published or
delivered by these uploads.
