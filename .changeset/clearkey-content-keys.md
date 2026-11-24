---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

With `PLAYBACK_KEY_ENCRYPTION_KEY` set, new track generations were encrypted with CENC `cbcs`
under a per-track content key stored only wrapped, beside one unencrypted rendition of the lowest
bitrate. The manifest marked each rendition's encryption, `?encrypted=1` selected the encrypted
bytes, and `POST /tracks/:id/license` released the key as a ClearKey licence only for a live play
session. Staff preview kept playing the clear rendition.
