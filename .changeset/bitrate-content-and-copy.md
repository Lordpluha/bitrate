---
'@bitrate/web-artists': major
'@bitrate/web-player': major
'@bitrate/api': major
---

Copy that named Spotify is gone. The artists portal no longer reproduces Spotify for Artists'
marketing page: `© 2026 Spotify AB` is `© 2026 Bitrate`, and the branded product names it
borrowed — Canvas, Marquee, Discovery Mode, Loud & Clear, Showcase, Clips, Segments, Fan Study,
Fan Support — are now plain descriptions of what each capability does, so the page no longer
claims another company's products. A testimonial that named a real recording artist as a
Spotify for Artists user was rewritten without her, rather than re-attributed to Bitrate.

The landing page claimed "517.69 million+ Spotify users worldwide" — a real Spotify figure that
would have become a fabricated claim about Bitrate. It now reads "Artists and listeners, in one
place" and asserts no number. Two footers carried `© 2025` and `© 2026 Spotify AB`; both are
now `© 2026 Bitrate`.

`Spotify Premium` is `Bitrate Pro`, matching the name `design.md` already uses.

The TOTP issuer for both user and artist two-factor auth changed from `Spotify` to `Bitrate`.
Authenticator apps key their entries on the issuer, so codes already enrolled keep working but
show under a second entry — enrolled users should re-scan.

Seed data no longer ships `Spotify Clone Studios` as a publisher or `Welcome to Spotify Clone`
as a playlist title.
