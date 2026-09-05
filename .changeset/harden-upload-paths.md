---
'@bitrate/api': patch
---

Hardened the CodeQL-flagged file-upload and cookie call sites in `apps/api` without
changing their behaviour: every Multer-supplied file path (track audio, track covers, user
avatars) is now reconstructed from its own directory and server-generated filename before
being opened or removed, rejecting any filename that would escape its directory. Short-lived
auth cookies (`pending_2fa_token`, `oauth_state`) now set `httpOnly`/`secure` as literal
keys at the `res.cookie()` call site instead of through a spread options object. The `access`
auth guards for users and artists no longer perform a redundant verification of a co-present
refresh-token cookie: that check could not be bypassed by an attacker (who simply omits the
cookie) and only rejected legitimate requests whose unrelated refresh token happened to be
stale.
