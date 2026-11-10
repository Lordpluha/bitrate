---
"@bitrate/api": patch
---

An expired login lock now resets the failed-attempt counter. Before, the counter stayed at the threshold after the 15-minute lock ran out, so one more wrong password locked the account again and sign-in kept answering 429.

The listener password-reset email now links to `/auth/reset-password`, the page the web player serves. It used to link to `/reset-password`, which redirected away and dropped the token. A password reset also lifts a login lockout now.
