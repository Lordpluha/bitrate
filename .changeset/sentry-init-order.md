---
'@bitrate/api': patch
---

Sentry now initialises before the modules it is supposed to trace.

`import './instrument'` sat fifteen lines down, after Nest, Express, helmet and the rest. Imports
evaluate in source order and Sentry's instrumentation patches modules as `init()` runs, so every
module already loaded was left untraced — which is most of the ones worth tracing. The error filter
and `SentryModule` worked, so errors were reported; HTTP and database spans were not.

It sits in its own import block, because Biome sorts within a block but preserves block order, and
alphabetical sorting is what had pushed it to the bottom in the first place. Verified by running
`biome check --write` over the file afterwards.
