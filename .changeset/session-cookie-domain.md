---
'@bitrate/api': patch
---

Fixed logging in leaving the user on the login page. The API issued its session cookies without a `Domain`, so they were host-only on the API's subdomain and the web apps' route guards — running on a different subdomain — never saw a session: login succeeded, the redirect to the player bounced straight back to the login page. The cookies now take an optional `COOKIE_DOMAIN` (e.g. `.bitrate.me`) and are scoped to the parent domain, logout clears them with the same attributes they were written with, and they use `SameSite=Lax` so a link followed from an email or an OAuth provider still carries the session.
