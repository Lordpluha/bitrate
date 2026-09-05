---
'@bitrate/ui-react': major
'@bitrate/web-player': major
'@bitrate/docs': minor
---

The design tokens now carry the Bitrate palette instead of Spotify's. `--color-primary` is
Bitrate Purple `#7c3aed` rather than Spotify green, and its foreground flipped from black to
white — black on that purple measures 3.69:1 and fails WCAG AA, white measures 5.70:1 and
clears it. The `green` scale was
retuned from Spotify's `#1db954` to `#10b981` and now serves only `success` and a chart series;
`blue`, `red` and `neutral` were retuned to the brand scales; `orange` was replaced by `amber`,
which is what `warning` and `chart-4` now reference. `--color-spotify-green` and
`--color-spotify-green-hover` are gone, and the `.bg-auth-spotify` utility is `.bg-auth-brand`.

A third theme, **dim**, joins dark and light. It is deliberately partial: `:root.dim` overrides
only the surface, text, border and action roles, so every other role — component-scoped roles
included — inherits its dark value. Adding a theme to
`apps/web-player/src/shared/constants/themes.ts` now propagates to the switcher, the provider,
and the no-flash boot script on its own, rather than needing three hardcoded lists updated.

Client storage keys moved from the `spotify*` prefixes to `bitrate*`, and the service-worker
cache is `bitrate-web-player-v1`, so saved playlists, recent searches, player position, the
restored session, and settings do not carry over and the old cache is evicted once.

The logo is unchanged on purpose while a Bitrate mark is being designed.
