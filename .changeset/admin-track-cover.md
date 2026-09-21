---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/admin': minor
---

The admin track list and detail responses now expose `cover`, the track's stored cover image filename, so the operator panel can render the track's actual artwork instead of a placeholder. `<bitrate-player>` in the track detail page now shows the track's real cover art, joined from the stored filename to the API's static URL, instead of its built-in placeholder.
