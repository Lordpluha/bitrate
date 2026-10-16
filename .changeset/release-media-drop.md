---
'@bitrate/web-artists': minor
---

Artwork and track upload dialogs accepted a file dragged onto them, alongside the Choose file
button. A dropped file went through the same format and size checks, and a drop during an
upload in progress was ignored instead of opening the file in the browser.
