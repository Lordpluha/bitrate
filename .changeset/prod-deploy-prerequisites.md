---
'@bitrate/docs': minor
---

The production stack could not start. `infra/nginx/conf.d/default.conf` declared an upstream for
a `docs` service that exists in neither the production compose nor the preprod stack unless its
`docs` profile is enabled — and nginx refuses to start when a static upstream does not resolve,
so the first `up` took the whole site down. That route now resolves through Docker's DNS at
request time, degrading to a 502 instead of a startup failure.

Two directives applied at server level and were inherited by every route, `/api` included:
`Cache-Control: public, max-age=3600` and `Access-Control-Allow-Origin: *`. Authenticated API
responses were served as publicly cacheable and readable cross-origin. Both are gone; caching
belongs to the routes that serve cacheable bytes, and CORS belongs to the API.

Production now terminates TLS. The routes and upstreams moved into `infra/nginx/snippets/`,
shared by the preprod HTTP server and a new production template that adds HTTPS, HSTS, an ACME
challenge location, and a redirect, with the domain substituted from `DOMAIN`.

The admin panel's Kottster secret key, API token, JWT salt, root credentials, and database
password were literals tracked in a public repository. The app has since been removed entirely
(ADR-0025), which narrows what they open but does not un-publish them: **the Kottster API token
must still be revoked in its dashboard.**

Also: every production container caps its logs at 10 MB × 3 files, `task db:backup` and
`task db:restore` were added, and the deployment guide was rewritten against the actual
repository — its commands pointed at paths that do not exist, and it described Elastic Beanstalk,
Cloud Run, Azure, and Kubernetes deployments that were never configured.
