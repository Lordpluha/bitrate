---
"@bitrate/api": patch
"@bitrate/web-player": patch
---

Switching tracks no longer floods the API with fragment requests. The API now exposes
`Retry-After` to the browser; the player read the hidden header as `0` and retried a paced
(429) fragment in a tight loop until the throttler blocked the listener. The player now waits
a second when the header is missing and gives up after five 429s, handing the fragment to its
regular backoff. nginx answers its own rate limit with 429 instead of 503 and gives CMAF
fragment ranges their own budget, so a track switch no longer trips the generic API limit.
