---
'@bitrate/admin': patch
---

Removed the development-only authentication bypass from the operator panel. The
`NG_APP_AUTH_BYPASS` build-time define, the placeholder operator it injected into the session
store, and the interceptor branch that suppressed the redirect on a failed refresh are all gone,
so `ng serve` now goes through the real login screen and a failed token refresh always returns to
it. Production bundles are unchanged — the flag was already hardcoded false there.
