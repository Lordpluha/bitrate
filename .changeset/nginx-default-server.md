---
'@bitrate/api': patch
---

The edge nginx owns port 80 outright, and stops naming its own version to anyone who asks.

The image ships `conf.d/default.conf`, which sorts before the rendered `prod.conf` and was
therefore the default server for port 80: every unrecognised `Host` got the stock nginx welcome
page — version number included — and, more consequentially, an ACME challenge for any name not
yet listed in `server_name` was answered by that block instead of from the webroot. That is
exactly the moment a new subdomain's first certificate is issued, so the failure would have
surfaced as an unexplained validation error. The HTTP block is now `default_server` and the
image's file is mounted over with an empty one.

`server_tokens off` removes the version from the `Server` header on every response.
