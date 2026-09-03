---
'@bitrate/web-player': patch
---

An unsupplied Docker build argument no longer produces a confusing "Invalid URL"
failure. A Dockerfile's `ENV X=${X}` sets the variable to an empty string when
its `ARG` was not passed, so `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` and
`API_URL` arrived present-but-empty and failed the URL format check instead of
the "required in production" check that names them. Empty is now treated as
absent, which also fixes the case where the build succeeded without enforcement:
`API_URL` of `''` is not nullish, so the `/api-media` rewrite resolved to a
relative destination rather than falling back to `http://localhost:3000`.
