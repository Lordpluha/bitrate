---
"@bitrate/api": minor
"@bitrate/admin": minor
---

The Overview dashboard gains a drill-down on its reports card. The API adds `GET /admin/overview/reports-by-type` under `overview:read`, returning moderation reports filed per UTC day over the same `days` window as the overview series (1 to 365, default 30), with one zero-filled series per entity type plus totals. The panel adds `/overview/reports`, a stacked bar chart of those series built from the existing chart components, a 7/30/90-day range kept in the URL, and a link per entity type to the moderation queue filtered by that type across every status. The reports card on the Overview links to it.
