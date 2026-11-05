---
"@bitrate/admin": patch
---

Fixed operator sign-in: the panel's API calls reached the static server and failed with 405; they
now go to the operator API, and the panel is served only through Cloudflare Access.
