---
'@bitrate/admin': minor
---

Added sortable column headers to every paginated operator list (artists, catalog, audit,
moderation, listeners, staff). Clicking a column cycles unsorted → ascending → descending →
unsorted, the sort is kept in the URL so it survives reload, refresh and back/forward, and
choosing a column always resets to page one. The catalog screen keeps saying plainly when it
is showing its attention-first default instead of a column sort, and clearing the sort
restores that default order.
