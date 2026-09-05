---
'@bitrate/docs': minor
'@bitrate/mobile': major
'@bitrate/svgr': patch
---

The project is now named Bitrate everywhere it names itself: repository metadata, README,
CONTRIBUTING, the Docusaurus site, the agent layer under `.claude/`, and the GitHub URLs,
which now point at `github.com/Lordpluha/bitrate`. `PRODUCT.md` no longer describes the brand
as undecided scaffolding — it records Bitrate, the purple primary, and the three themes as
settled, and points at `apps/docs/docs/brand/` for the rest.

The Expo app changed its display name, slug, deep-link scheme, and bundle identifier
(`com.lordpluha.spotifymobile` to `com.lordpluha.bitratemobile`), so existing installs and
deep links do not carry over.

`@bitrate/svgr`'s path-resolution tests derived the workspace root from one developer's home
directory, so they only passed on that machine and broke the moment the checkout was renamed.
They now derive it from the test file's own location.
