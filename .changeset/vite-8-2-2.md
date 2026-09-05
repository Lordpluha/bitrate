---
'@bitrate/ui-react': patch
'@bitrate/web-player': patch
'@bitrate/desktop': patch
---

Bumped Vite from 8.0.16 to 8.2.2 in every workspace on that major.

The bump was prompted by `build.emptyOutDir` appearing not to clear `packages/ui-react/dist`,
but that turned out to be correct behaviour rather than a bug, and 8.2.2 behaves the same:
Vite empties the directories rollup actually writes (`dist/esm`, `dist/cjs`) and not the
nominal `build.outDir`. `dist/types` comes from `vite-plugin-dts`, which is not a rollup
output, so nothing built in ever clears it — that is what `scripts/clean-dist.mjs` is for,
and both it and `vite.config.ts` now say so.
