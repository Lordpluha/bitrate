---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-artists': minor
---

Add the artist Analytics page for Bitrate-owned listening signals. For the last 7, 28 or
90 UTC days it shows plays and distinct listeners with the change against the previous
period in words, plays per day as a single-series bar chart with hover values and a table
view, and the top tracks. An artist without published tracks, or whose tracks nobody has
played yet, sees a clear No data yet state instead of a chart of zeroes, and Spotify,
Apple Music and YouTube Music read Not connected rather than zero. Analytics is now a real
section in the workspace navigation and the dashboard links to it.
