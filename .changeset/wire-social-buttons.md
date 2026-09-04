---
'@bitrate/web-artists': patch
---

Fixed the registration page's Google and Facebook buttons, which previously had no handler or href and did nothing when clicked; they now link to the same OAuth endpoints the login page uses. Removed the duplicated `/auth/*` route stubs (`/auth`, `/auth/login`, `/auth/registration`, `/auth/forgot-password`), which only redirected to the equivalent flat routes, and updated `middleware.ts` to redirect unauthenticated requests to the flat `/login` route directly instead of through the removed `/auth/login` stub.
