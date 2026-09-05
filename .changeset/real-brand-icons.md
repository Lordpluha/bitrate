---
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
---

Both apps now carry the Bitrate mark as their icon, and the artists portal's primary action is
the brand purple.

The tab icon was a 32×21 crop of the mark — the wrong aspect ratio, no ground, and unreadably
soft at any size a browser actually renders. It is replaced by a multi-size favicon (16/32/48),
an `apple-icon`, and PNG manifest icons, all cut from the mark in the social card. This also
retires `public/icon.svg`, which the PWA manifest still pointed at and which still held the
previous product's mark rather than ours.

The artists portal painted its submit buttons and the registration progress bar with a fixed
`green-400` from the palette instead of the `primary` role, so repointing the brand colour to
purple never reached them — they stayed mint green through the whole rebrand. They use the
`primary` Button variant now, which also gives them the hover and active states the fixed fill
had no way to express. The OAuth buttons keep their white `artistCard` variant. The browser tab
also read `@bitrate/artists`, the raw package name.
