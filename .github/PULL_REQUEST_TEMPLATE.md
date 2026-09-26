## Summary

<!-- What changed and why, in a few sentences. -->

Closes #

## Type

<!-- Keep the one that fits, delete the rest. -->

`feat` · `fix` · `refactor` · `perf` · `test` · `docs` · `build` · `ci` · `chore` · `style`

## Surfaces

<!-- Delete what this PR does not touch. -->

`api` · `web-player` · `web-artists` · `admin` · `mobile` · `desktop` · `player` · `ui-react` · `contracts` · `docs` · `infra` · `ci`

## How it was verified

<!-- The commands you actually ran, and what they said. Screenshots or a clip for UI changes. -->

```bash
```

## Checklist

- [ ] `pnpm lint`, `pnpm check-types` and the affected tests pass locally
- [ ] Changeset added, or the change is not user/consumer-visible (docs, rules, tests, chore)
- [ ] Docs updated — `apps/docs` for behaviour, an ADR for an architectural decision
- [ ] New env vars added to every `.env.example` and to `apps/docs/docs/guides/environment.md`
- [ ] Migration is reversible and seeded data still loads (Prisma changes only)

<!--
Need the exhaustive template — breaking change, release, or a review that wants every box?
Reopen this PR with ?template=detailed.md appended to the compare URL.
-->
