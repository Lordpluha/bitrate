---
'@bitrate/api': major
'@bitrate/contracts': major
'@bitrate/web-player': minor
---

Every play now opens a playback session (ADR-0067). `POST /tracks/:id/play-sessions` returns the manifest with a signed token and replaces `GET /tracks/:id/manifest`, which was removed. `GET /tracks/:id/cmaf/:bitrate` authorises by the `?t=` token instead of the access cookie; it serves a `Range` of at most one fragment (~10 s) exactly and answers any longer or missing range with one response released no faster than real time plus a 60-second allowance, so a track can no longer be downloaded at once. A session ahead of that budget gets `429` with `Retry-After`. Logout and password reset revoke the user's sessions, and the token is redacted from API and nginx logs. The web player opens a session for each play, carries its token on every rendition request, reopens the session once on `403` and waits out a `429`.
