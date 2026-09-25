---
'@bitrate/api': patch
---

Edits to the built-in MODERATOR role's permissions and description now survive an API restart;
boot only creates a built-in role that is missing. The MODERATOR template is an explicit list, so a
permission added to the catalogue no longer joins it without a deliberate change.
