---
'@bitrate/api': major
'@bitrate/contracts': major
'@bitrate/converter': major
'@bitrate/desktop': major
'@bitrate/docs': major
'@bitrate/mobile': major
'@bitrate/ncs-parser': major
'@bitrate/performance-test': major
'@bitrate/svgr': major
'@bitrate/ui-react': major
'@bitrate/vite-svgr': major
'@bitrate/web-artists': major
'@bitrate/web-player': major
---

Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
the rebranding described in `brand.md`. Imports, `--filter` targets in `Taskfile.yml`,
`lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
packages kept the original names, because those packages never existed under the new namespace.
