---
'@bitrate/docs': patch
'@bitrate/ui-react': minor
---

Both static-site images install where they build instead of copying `node_modules` between stages,
and Storybook's chrome carries the product's identity.

The cross-stage copy is what made the documentation image unbuildable. pnpm's isolated linker
created `apps/api/node_modules` and `apps/web-artists/node_modules` — importers it read from the
lockfile, whose `package.json` the image never even copied — while creating none for `apps/docs`,
the one package it did copy. `COPY --from=dependencies /app/apps/docs/node_modules` then failed
with "not found", which points at the copy rather than at the install that actually decided
nothing needed linking.

Both images now run `pnpm install --frozen-lockfile --filter <pkg>...` in the stage that builds.
The documentation build also has to keep dev dependencies: the site is configured in TypeScript,
so the compiler must be present even for a production build, and pnpm drops them when `NODE_ENV`
is `production`.

`packages/ui-react` already had a `storybook:build` script, so the image uses it rather than the
second one this branch briefly added. A `.storybook/manager.ts` sets the brand title and a dark
base to match the library, whose own default theme is dark — a light manager around dark
components reads as a rendering fault.

`task prod:deploy` pulls the images CI publishes and restarts, with `--no-build` so a missing
image fails loudly instead of silently falling back to a twenty-minute build on the server.
