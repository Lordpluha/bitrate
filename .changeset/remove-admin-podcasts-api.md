---
'@bitrate/api': major
'@bitrate/contracts': major
---

Removed the operator podcast endpoints (`/admin/podcasts`, episode take-down and restore) and the `podcasts:read|delete|restore` permissions because Bitrate became music-only (ADR-0066). A migration strips those permissions from stored roles and staff.
