---
"@bitrate/api": minor
"@bitrate/admin": minor
---

Genres can now be managed from the operator panel. The API gains `GET/POST /admin/genres`, `GET/PATCH/DELETE /admin/genres/:id` behind the new `genres:read`, `genres:write` and `genres:delete` permissions: the slug is derived from the name when absent, the colour must be a `#rrggbb` hex string, a taken slug answers 409, and deleting a genre that tracks, albums or artists still reference answers 409 with the reference counts (the delete is physical, no migration). The panel adds `/genres`, `/genres/new` and `/genres/:id` with a confirm dialog for the delete. Only `genres:read` joins the built-in MODERATOR template, and that template only seeds the role on first boot: existing moderators gain nothing until an administrator edits them on `staff/:id`; `genres:write` and `genres:delete` stay administrator-only.
