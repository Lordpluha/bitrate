---
'@bitrate/admin': minor
---

Added English/Ukrainian interface language support to the operator panel: a Transloco-driven
locale switcher in the sidebar, localized date formatting that reacts to the chosen language
without a reload, and translated login/navigation text. A CI check now fails the build if a
referenced translation key is missing from either language file.
