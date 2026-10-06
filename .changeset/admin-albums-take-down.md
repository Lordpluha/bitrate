---
"@bitrate/api": minor
"@bitrate/admin": minor
---

Whole releases can now be taken down from the operator panel instead of track by track. The API gains `GET /admin/albums` (search by title, `status=active|deactivated|all` defaulting to active, `artistId`, and a `createdAt`/`title`/`releaseDate` sort allowlist), `GET /admin/albums/:id` with the album's tracks in disc and track order and each track's processing status, `DELETE /admin/albums/:id` (soft delete) and `POST /admin/albums/:id/restore`, behind the new `albums:read`, `albums:delete` and `albums:restore` permissions. Taking an album down only stamps the album: its tracks are not touched and stay independently manageable. The panel adds `/albums` and `/albums/:id` with a confirm dialog and optional reason for take-down and restore, and an Albums entry in the sidebar. Only `albums:read` joins the built-in MODERATOR template, and that template only seeds the role on first boot: existing moderators gain nothing until an administrator edits them on `staff/:id`; `albums:delete` and `albums:restore` stay administrator-only.
