---
'@bitrate/api': minor
---

Privacy settings now take effect on the server: a private session records no listening, explicit content can be hidden from search and the feed, and three new settings (`showListeningActivity`, `followersVisible`, `publicPlaylistsOnProfile`) control friend activity, the new public follower lists (`GET /users/{id}/followers`, `GET /users/{id}/following`) and profile playlists. `GET /users/me/following/activity` shows what the people you follow last played. Recording a listen now answers `{ recorded, id, listenedAt }`.
