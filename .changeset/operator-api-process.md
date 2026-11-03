---
'@bitrate/api': major
'@bitrate/contracts': major
'@bitrate/admin': patch
---

The operator API moved into a process of its own (ADR-0068). `main.admin.ts` serves `/api/v1/admin/*` and the health and metrics endpoints on `ADMIN_API_PORT` (3007), and the public API process no longer registers any operator route. In production the operator API is reached only through the admin panel's own host; `api.<domain>` answers 404 for operator paths. Staff session cookies are now host-only on that host instead of spanning the parent cookie domain, and signing in, refreshing or signing out also clears the staff cookies an older session left on the parent domain, so staff sign in once more after the release. Each process publishes its own OpenAPI document: the public contract `v1.ts` no longer contains the operator paths, which moved to `admin-v1.ts`, imported as `@bitrate/contracts/admin`. Each document now declares one security scheme per session cookie, named after the cookie, instead of a single `cookie` scheme overwritten by the last one. The public API also stops allowing the admin panel's origin in CORS. The admin panel now calls the operator API on its own origin.
