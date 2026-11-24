---
'@bitrate/web-player': minor
---

Web-player played encrypted tracks (ADR-0077): the manifest schema kept each rendition's
encryption and accepted a clear and an encrypted rendition of one bitrate, encrypted byte ranges
were requested with `?encrypted=1`, and ClearKey licence requests went to
`POST /tracks/:id/license` with the track's play session, reopening an expired session once.
