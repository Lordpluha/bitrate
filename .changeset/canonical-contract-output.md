---
'@spotify/contracts': patch
'@spotify/converter': minor
---

`gen:api` now formats what it writes. `astToString` emits the TypeScript
printer's own style — semicolons and a four-space indent — while the committed
`src/api/v1.ts` is Biome-formatted, so regenerating always reported the whole
file as changed and the CI reproducibility check could never pass on any branch.
The generator runs Biome over its output, making the command idempotent, and
`openapi-typescript` is now declared as a dependency of the package that imports
it rather than being borrowed from another workspace via hoisting.

The converter also exposes its CMAF and MP4 index helpers as package exports,
and its test suite runs in CI alongside the API that consumes it.
