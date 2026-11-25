---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Listeners' finished plays could be reported through `POST /me/playback-events` (how long they listened, how the play ended and where it started), stored once per play and never during a private session. Listeners could mark tracks and artists "Not interested", which removed them from "Made For You", and exclude playlists, albums and tracks from their taste profile under `/me/taste`. Playback events older than 13 months were removed daily.
