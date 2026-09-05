---
'@bitrate/api': patch
---

Sentry events now carry a release and an environment. The release is the deployed
version of the API, read from `SENTRY_RELEASE`, and the environment comes from
`SENTRY_ENVIRONMENT` rather than from `NODE_ENV` alone, so a deploy target labels
its own events instead of relying on one variable being set correctly. Trace and
profile sampling now follows the resolved environment for the same reason. Both
values fall back to their previous behaviour when unset, so nothing changes for a
container started outside the deploy workflow.
