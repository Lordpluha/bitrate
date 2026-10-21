---
"@bitrate/api": minor
"@bitrate/contracts": minor
"@bitrate/web-player": patch
---

Podcast episodes became searchable on the server: `GET /v1/podcasts/{id}` accepted an optional
`q` that narrowed the episode page and its total to a case-insensitive title or description
match, and the podcast page searched and paged through every episode with it instead of
filtering only the first 50 in the browser, while saving an episode updated the library
optimistically and reported failures.
