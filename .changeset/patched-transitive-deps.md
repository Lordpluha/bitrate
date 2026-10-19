---
'@bitrate/docs': patch
'@bitrate/api': patch
'@bitrate/mobile': patch
'@bitrate/web-player': patch
---

Transitive dependencies with published advisories were moved to patched releases through workspace overrides: tinypool 2.2 under Docusaurus (two critical advisories), deepmerge-ts 8 under the Prisma CLI, serialize-javascript 7, uuid 11, postcss-selector-parser 7 and katex 0.18. node-forge and braces, used only by Expo's build tooling, have no patched release yet and are listed in the audit's ignore list with that reason.
