---
'@bitrate/admin': minor
---

Restructured the operator panel into four clean-architecture layers — `domain`, `application`,
`infrastructure` and `presentation` — with repository ports as the seam between them. Business
rules that used to live in components (how long a track may sit in processing, whether an account
can still be deactivated) are now tested domain functions, and the API's vocabulary stops at a
mapper instead of reaching templates. Resolving a report that already holds the target status no
longer issues a request, so it no longer writes an audit entry saying nothing changed.
