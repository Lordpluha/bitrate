---
'@bitrate/web-artists': patch
---

Fixed the artists portal middleware redirecting every visitor to the login page. The guard denied access by default and its exemption list omitted the landing page and the reset-password route, so the portal's only real page was unreachable without a session. It now gates an explicit list of authenticated routes instead, leaving the landing, the auth flows, and static assets public.
