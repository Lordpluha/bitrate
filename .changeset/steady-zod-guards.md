---
'@bitrate/api': patch
'@bitrate/admin': patch
'@bitrate/web-artists': patch
'@bitrate/web-player': patch
'@bitrate/ui-react': patch
'@bitrate/ncs-parser': patch
---

Moved zod to 4.6.7, multer to 2.5.0, body-parser to 1.20.9 and 2.4.0, and undici 8 to
8.12.2 to close the high-severity denial-of-service advisories in shipped code. nestjs-zod
is patched so nullable fields stay nullable strings in the API contract under zod 4.6.
ISO date-time strings validated by zod now need seconds, which `toISOString()` always has.
