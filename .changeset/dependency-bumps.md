---
'@bitrate/web-player': patch
'@bitrate/web-artists': patch
'@bitrate/ui-react': patch
---

Bumped `@tanstack/react-query`/`@tanstack/react-query-devtools` from 5.101.0 to 5.103.1 and `lucide-react` from 1.18.0 to 1.47.0 across the web apps and the shared component library, keeping a single resolved copy of each in the lockfile. The `Spinner` and loading `Button` now render an additional `lucide-loader-2` class alongside `lucide-loader-circle` on the loading icon, a cosmetic side effect of the lucide-react upgrade with no visible change.
