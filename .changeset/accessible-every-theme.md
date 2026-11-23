---
'@bitrate/tailwind': minor
'@bitrate/ui-react': minor
'@bitrate/player': minor
'@bitrate/web-player': minor
'@bitrate/web-artists': patch
'@bitrate/admin': patch
---

Brought the web surfaces to WCAG 2.2 AA in the dark, light and dim themes, with CI gates.

- **Tokens:** text and filled-control contrast holds in every theme, through the new
  `text-brand`, `destructive-surface` and `text-contrast-subdued` roles. A forced-colours layer
  keeps focus, selection and pressed states visible.
- **Player:** seek and volume speak human values through the new `seekValue` and `volumeValue`
  labels.
- **ui-react:** list items, separators and lint suppressions are fixed. A `Button`
  `loadingLabel` was added.
- **web-player:**
  - Settings → Keyboard switches off single-key shortcuts and lists them all.
  - Arrow keys no longer steal page scrolling.
  - Every page has a title.
  - Accessible names include their visible labels.
- **web-artists:** links in text are underlined, and the 404 page has its own surface.
- **admin:** `<html lang>` follows the language switch, and destructive buttons meet contrast.
- **Skip links:** added to the web-player and admin shells.
- **axe gates:** run over ui-react stories, player layouts and the main web routes.
