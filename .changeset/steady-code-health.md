---
"@bitrate/api": patch
"@bitrate/web-player": patch
"@bitrate/web-artists": patch
"@bitrate/admin": patch
"@bitrate/ui-react": patch
"@bitrate/player": patch
"@bitrate/converter": patch
"@bitrate/svgr": patch
---

A code-health pass fixed bugs found in review and removed duplicated and wasteful work across
the stack. The API created OAuth accounts atomically, deleted replaced avatars, closed storage
streams on failure, kept muted notification categories from crowding out releases, reported
playlist position races as conflicts and re-checked websocket sessions on a timer instead of on
every message, with narrower reads and shared admin take-down, OAuth and ranking helpers. The
landing page gave every scene its own particle layout again and stopped per-frame style reads;
the player stopped rewriting the store on every progress tick and mutation errors were toasted
once. The admin panel told load failures apart from missing records and kept the page when
navigating search history; the artist dashboard themed its verify-email page and refreshed only
the caches a release write changed. The carousel released its re-init listener and honoured
consumer gaps, the player engine ignored superseded play requests, and the MP4 indexer and SVG
colour detection did less work per file.
