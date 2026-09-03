---
'@bitrate/api': patch
---

Error responses now carry the label that matches their status code. The exception filter seeded
the `error` field with `Internal Server Error` and replaced it only when the exception supplied
one of its own, so every exception that omits the field — nestjs-zod's validation exception among
them — answered `400` under a `500` label. A rejected registration reported
`{"statusCode":400,"error":"Internal Server Error"}`.

The label is derived from the resolved status instead, and an exception that does supply its own
still wins.
