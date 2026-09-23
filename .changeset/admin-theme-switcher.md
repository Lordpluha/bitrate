---
'@bitrate/admin': minor
---

Added a working dark/light/dim theme switcher to the operator panel. A single button in the sidebar footer cycles through the three themes, sharing its silhouette with the collapse control beside it so it reads the same whether the rail is expanded or collapsed. The chosen theme is remembered per browser and applied as a class on `<html>`, matching the token-driven theme mechanism `@bitrate/ui-react` already ships. An inline script in `index.html` applies the stored theme before Angular's bundle loads, so the first paint never flashes the wrong one.
