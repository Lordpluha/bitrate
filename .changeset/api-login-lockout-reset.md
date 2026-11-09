---
"@bitrate/api": patch
---

An expired login lock now resets the failed-attempt counter. Before, the counter stayed at the threshold after the 15-minute lock ran out, so one more wrong password locked the account again and sign-in kept answering 429.
