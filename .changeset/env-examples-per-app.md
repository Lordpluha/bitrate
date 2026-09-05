---
'@bitrate/api': patch
'@bitrate/web-player': patch
'@bitrate/web-artists': patch
---

Each app ships a `.env.example` generated from its own schema, and the real development env files
leave version control.

`apps/api/.env.development` and `apps/web-player/.env.development` were tracked, so a developer
inherited someone else's values instead of choosing their own. They are untracked now and
`.gitignore` covers the pattern so they cannot come back by accident.

The examples are generated from each app's `env.schema.ts` rather than copied from the files they
replace: every variable appears, grouped by whether the app refuses to start without it, and the
defaults shown are the schema's own. `apps/api/.env.test` stays tracked on purpose — the E2E suite
reads it and the CI step that runs it has no environment of its own, so removing it breaks the
pipeline rather than tidying it.
