---
'@bitrate/admin': minor
---

Filters and the current page of every operator list now live in the URL, so a pasted or
bookmarked link reproduces the exact view and browser history behaves. The address bar is the
single source of truth: a screen action writes to it and an effect reads back, so nothing in the
load path can navigate and re-trigger itself. Defaults are omitted from the query string, a
discrete change adds a history entry while typing in a search box replaces one, and the
moderation queue keeps its OPEN default with an explicit token for showing everything.

Two defects in the shared list state were fixed on the way. A slower response could overwrite a
newer one, which was harmless while only a button could start a load and is not once the URL can;
and a deep link past the first page was silently dropped, because the page guard compared against
a page count that is still 1 before anything has loaded.
