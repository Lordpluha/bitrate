---
'@bitrate/api': patch
---

OAuth redirect URIs now include the API's global prefix and version. The
callback routes live under `/api/v1`, but the URI handed to Google and Facebook
pointed at `/auth/oauth/<provider>/callback`, which 404s — so sign-in would have
failed on the return leg the moment credentials were configured, for both the
user and the artist flows.
