---
'@bitrate/docs': minor
'@bitrate/mobile': minor
'@bitrate/desktop': minor
---

Every app now wears the Bitrate mark instead of its scaffold's icon.

Three apps still shipped their template's identity: the docs site showed the Docusaurus dinosaur as
both logo and favicon, `apps/desktop` carried Tauri's default icon across all sixteen platform
sizes, and `apps/mobile` carried Expo's — including the Android adaptive icon, its themed
monochrome layer, the splash image, and the web favicon.

The desktop set is regenerated with Tauri's own `tauri icon`, so `.icns` and `.ico` are properly
multi-resolution rather than renamed PNGs. Its Android and iOS output was discarded: this app
targets desktop only, and those thirty-five files would have been dead weight.

Mobile needed more than new pixels. The Android adaptive foreground keeps the mark inside the
central 66% that the launcher mask guarantees — verified against circular, squircle, and square
masks — and the monochrome layer is a flat silhouette so Android 13 can recolour it. `icon.png`
carries no alpha channel, which iOS rejects. `app.json` also held Expo's pale blue `#E6F4FE`
adaptive background and a white/black splash; all three are the brand dark now.

The docs site's social card was Docusaurus's, its navbar read `@bitrate/docs`, and the logo's alt
text was "Site logo". Five unused template images went with them.

Its `url` is still Docusaurus's `your-docusaurus-site.example.com` placeholder — the site is not
deployed anywhere, so the correct value depends on where it will live.
