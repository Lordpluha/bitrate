---
'@bitrate/web-player': patch
---

The service worker no longer sweeps caches left by the pre-rebrand prefix. The product has no installed clients to clean up after, so the sweep only kept a dead brand name in the source; its unit spec now asserts the opposite guarantee — that caches outside the worker's own prefix are never touched.
