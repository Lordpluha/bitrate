---
'@bitrate/ui-react': major
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
---

The Bitrate mark replaces the previous product's logo everywhere it was still rendering.

`assets/icons/logo-icon.svg` now holds the supplied vector, so `LogoIcon` carries the real mark
and every screen that already used it — six auth screens across both apps — picked it up without
a call-site change. svgr expands the gradient's six stops into props with the designer's values as
defaults, which means the two screens passing `primaryColor="#FFF"` would have recoloured only the
first stop into a white-to-purple ramp; they now render the mark as designed.

Removed: `spotify-logo.svg`, `logo.svg`, `artistlogo-icon.svg`, `footer-logo.png`, and the
`SpotifyLogo`, `Logo`, and `ArtistlogoIcon` components generated from them. **`SpotifyLogo` and
`ArtistlogoIcon` are no longer exported** — the header, both footers, and the artists lockup render
`LogoIcon` instead. The header's accessible name also read "Spotify Home".

The wordmark is not in this change. It exists only as pixels inside the social cards, so the
lockups render the mark alone until a vector arrives; the slots are square rather than 112×32.

Every icon — the multi-size favicon, `apple-icon`, and the PNG manifest icons — is rasterised from
that vector now instead of cut from the social card, and both apps also serve `icon.svg` directly
for browsers that prefer it.
