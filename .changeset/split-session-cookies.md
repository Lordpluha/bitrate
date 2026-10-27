---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-player': patch
'@bitrate/web-artists': patch
---

Gave each account kind its own session cookies: `user_access_token`/`user_refresh_token` for
the player, `artist_*` for the artists portal and `staff_*` for the admin panel. All of them
live on the shared cookie domain, so the single `access_token`/`refresh_token` pair let a
sign-in to one app overwrite the session of another — signing in to the admin logged the
player out, and the other way round. The names are now fixed in code (`SESSION_COOKIE_NAMES`,
mirrored in `@bitrate/contracts`) and `ACCESS_TOKEN_NAME`/`REFRESH_TOKEN_NAME` are gone.
Existing sessions sign in once more; the old shared cookies are cleared on the next sign-in
or sign-out.
