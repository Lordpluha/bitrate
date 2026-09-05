---
'@bitrate/api': patch
---

nginx resolved each upstream host once at startup and cached the address for the life of the
process, so every `docker compose up` that recreated a container left the proxy answering 502
until someone restarted nginx by hand. Routing now goes through a variable with Docker's embedded
resolver, which defers the lookup to request time.

A side effect worth having: `nginx -t` used to fail with "host not found in upstream" unless the
application containers were already running, so the configuration could not be validated on its
own. It now checks anywhere.
