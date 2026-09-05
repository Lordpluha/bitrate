---
'@bitrate/docs': patch
'@bitrate/ui-react': patch
---

The documentation and Storybook containers report their health correctly.

Their healthcheck asked for `http://localhost:8080/`, and `/etc/hosts` in these images maps
`localhost` to both `127.0.0.1` and `::1`. wget tries the IPv6 address first while `listen 8080`
binds IPv4 only, so every check was refused and both containers sat marked unhealthy while serving
their sites correctly to everyone. It asks for `127.0.0.1` now.

This mattered beyond a misleading `docker ps`: the deploy gate treats an unhealthy container as a
failed release, so it would have blocked deploys of two services that were working.
