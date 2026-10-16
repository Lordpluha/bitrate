---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-artists': minor
---

Add the delivery plan and Distribution page, and the returning-artist dashboard. Artists
plan which stores (Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, TIDAL) and
which territories a draft release goes to; saving a plan sends nothing. Each store reports
an honest state: Not connected while no distribution partner is connected, and Pending,
Live, Failed or Taken down only once a partner reports it. Behind this is one distribution
adapter interface with a not-connected default and the documented delivery state machine,
ready for a confirmed partner. The dashboard now shows, once a release exists, the current
release with its remaining steps, items needing attention, next tasks, catalogue counts,
upcoming planned dates and an analytics placeholder that never shows invented numbers.
