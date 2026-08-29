---
'@spotify/api': minor
---

Added `API_RATE_LIMIT_MAX` and `API_RATE_LIMIT_WINDOW_MS` environment overrides for the
global throttler so a single-IP load test can measure the API instead of the rate limiter.
Both fall back to the previous 100 requests per 60 seconds when unset or not a positive
finite number, and neither loosens the auth-route throttle, which stays at 10 per minute.
