---
'@bitrate/mobile': minor
---

The mobile app gained sign-in, including the two-factor code step, registration with the legal
consent, and password recovery (request a link, set a new password). The session rides on the
API's cookies in the platform cookie store, survives restarts, and a session that cannot be
refreshed returns the listener to the login screen instead of failing.
