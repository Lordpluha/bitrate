---
'@bitrate/web-player': patch
---

Search results appear again. The client schema required the singular type name
("playlist") while the API labels each result with the plural form it was
queried by ("playlists"), and required all four result buckets even though the
API returns only the ones asked for. Either mismatch rejected the whole
response, so a search that found something rendered as "No results found" while
a search that genuinely found nothing looked fine.

The profile grids use auto-fill like every other grid in the app instead of
auto-fit, which had stretched a couple of followed artists across half the page.
