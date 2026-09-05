---
'@bitrate/web-player': patch
---

Aligned the web player with the regenerated OpenAPI contract: track responses now validate the `playbackVersion`, `fragmentTimescale`, and `durationTicks` fields the API already returns, and the user search request no longer sends invalid path parameters for an endpoint that only accepts query parameters.
