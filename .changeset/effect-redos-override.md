---
'@bitrate/api': patch
---

Pinned the `effect` package that Prisma's config loader brings in to a release with the fix for GHSA-7589-6fvf-x4pw (a ReDoS in `Schema.TemplateLiteral`), because no Prisma release ships it yet.
