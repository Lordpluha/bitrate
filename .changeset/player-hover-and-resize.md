---
'@bitrate/web-player': patch
---

The next/previous track hover cards space the cover art away from the label
instead of butting them together. Dragging a sidebar edge now tracks the pointer
directly: the 300ms grid transition that makes the collapse/expand buttons
smooth was also animating every drag frame, so the sidebar trailed the cursor.
The main footer's Facebook link uses the glyph icon matching the Twitter and
Instagram marks instead of a filled blue disc.
