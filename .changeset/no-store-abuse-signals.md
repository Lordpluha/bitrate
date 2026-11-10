---
'@bitrate/api': minor
---

Rendition responses stopped being cached (`Cache-Control: private, no-store`), so whole tracks no
longer sat in the browser's disk cache. Opening play sessions now reported listeners who started
more than 40 different tracks in ten minutes and refused new tracks with 429 at 120.
