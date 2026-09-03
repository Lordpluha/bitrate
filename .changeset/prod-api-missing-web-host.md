---
'@bitrate/api': major
---

The production API could not start. `apps/api/env.schema.ts` requires `WEB_HOST`, and
`infra/docker-compose.prod.yaml` never passed it — the container would fail Zod validation and
exit before serving a request. Preprod passed it all along, which is why CI never caught it.

The service's environment moved from map form to list form so optional variables can be passed
through by bare name. `KEY=${KEY}` gives the container an empty string when the variable is
unset, and the optional URL and token fields are validated with `z.url()` and `.min(32)`, both
of which reject an empty string — so writing them out in map form would have replaced a missing
variable with an invalid one. Mail, S3, Sentry, and metrics settings now reach the container
when they are configured and stay absent when they are not.
