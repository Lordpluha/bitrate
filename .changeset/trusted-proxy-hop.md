---
'@spotify/api': patch
---

The reverse proxy no longer lets a client choose its own IP address. `/api` was
hardened to send `X-Forwarded-For: $remote_addr`, but `/uploads` — which also
reaches the API — set no proxy headers at all, so a client-supplied
`X-Forwarded-For` passed through untouched and, with `TRUST_PROXY_HOPS=1`,
became `req.ip`. Rate-limit buckets and audit IPs were spoofable on that route.
The remaining blocks appended the client value instead of replacing it; since
this nginx is the outermost proxy, every block now sends `$remote_addr`.
