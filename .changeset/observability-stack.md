---
'@bitrate/api': patch
---

`GET /metrics` is now backed by `prom-client` instead of a hand-rolled counter — it still serves the same route with the same bearer-token gate, but now also reports process memory, CPU and event-loop lag alongside the existing per-route HTTP request count and duration, and the duration metric is a proper histogram in seconds rather than a cumulative-milliseconds counter. No client of this route is known to exist yet, so this is not expected to be a breaking change in practice.
