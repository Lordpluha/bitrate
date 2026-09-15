---
'@bitrate/docs': minor
---

Added search to the documentation site. It runs entirely in the browser against an index built at compile time, so it ships inside the docs image and adds no third-party processor — Algolia DocSearch would have required an application, an API key, and every query leaving the site. The index covers docs and blog in English and Russian, since part of the guides is written in Russian and without its stemmer those pages would match on exact word forms only.
