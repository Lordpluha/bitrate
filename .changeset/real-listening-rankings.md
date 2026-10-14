---
'@bitrate/api': minor
---

Rankings now come from real listening: a scheduled job recomputes track play counts, popularity and artist monthly listeners from listening history, and new endpoints serve an artist's top tracks (`GET /artists/{id}/top-tracks`), public playlists featuring an artist (`GET /artists/{id}/playlists`), an artists chart (`GET /charts/artists`) and genre-filtered track charts (`GET /charts/tracks?genre=`).
