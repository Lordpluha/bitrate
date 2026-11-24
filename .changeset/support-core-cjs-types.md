---
'@bitrate/support-core': patch
---

Declared `main`, `types` and `typesVersions`, so TypeScript consumers that compile to CommonJS with `node10` module resolution, such as `apps/api`, resolve the types of both entries.
