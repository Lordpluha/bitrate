# @bitrate/ncs-parser

## 1.0.1

### Patch Changes

- 9be2b87: Moved zod to 4.6.7, multer to 2.5.0, body-parser to 1.20.9 and 2.4.0, and undici 8 to
  8.12.2 to close the high-severity denial-of-service advisories in shipped code. nestjs-zod
  is patched so nullable fields stay nullable strings in the API contract under zod 4.6.
  ISO date-time strings validated by zod now need seconds, which `toISOString()` always has.

## 1.0.0

### Major Changes

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.
