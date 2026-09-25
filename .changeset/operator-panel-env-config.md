---
'@bitrate/admin': patch
---

Moved the operator panel's configuration out of the source tree and into `.env` files. The API
base URL no longer sits hardcoded in three `define` blocks in `angular.json`, in a fallback inside
`api.config.ts`, and in a Dockerfile `ARG` default, and the dev-server port no longer sits in both
`angular.json` and the package scripts. A small bridge script reads the `.env` chain — Angular has
no `.env` support of its own — validates it, and writes the module the application imports, so a
missing variable now fails the command that needs it by name instead of quietly producing a bundle
pointed at localhost.
