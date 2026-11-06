---
'@bitrate/api': major
'@bitrate/contracts': major
'@bitrate/web-artists': patch
'@bitrate/web-player': patch
---

Moved every artist-only endpoint under `/artists/` (ADR-0070). The artist workspace is now `/artists/me/...`: `/releases/**` → `/artists/me/releases/**`, `/release-tasks` → `/artists/me/tasks`, `/distribution` → `/artists/me/distribution`, and `/artist-{dashboard,analytics,music,notifications,profile,search,workspace}` → `/artists/me/{dashboard,analytics,music,notifications,profile,search,workspace}`. Account deletion is `DELETE /artists/me` instead of `DELETE /artists/:id`. The listener's followed artists moved from `GET /artists/me/following` to `GET /users/me/following/artists`. Removed the unused `POST /tracks`, `PUT /tracks/:id`, `POST /albums`, `PUT /albums/:id`, `DELETE /albums/:id` and `PUT /artists/:id`. web-artists and web-player call the new paths.
