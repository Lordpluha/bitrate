---
'@bitrate/admin': patch
---

Shrank the admin panel's initial bundle by about 240 kB (roughly 35 kB gzipped), back under its 800 kB budget. Zod is now imported as a namespace, so the build drops its unused error-message locales instead of shipping all of them on first load.
