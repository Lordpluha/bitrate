---
'@bitrate/web-artists': minor
'@bitrate/ui-react': patch
'@bitrate/web-player': patch
---

The artists portal's public page no longer copies Spotify for Artists. The old page reproduced its structure, copy, product names (Campaign Kit, Marquee, Showcase, Discovery Mode, Canvas, Countdown Pages, Loud & Clear), blog images, and photos and videos of real artists; all of it is gone, together with its mega-menu header, footer and the non-functional language switcher. The new page says what the workspace does today — release workspace, tasks, distribution plan, analytics — with sign-up and log-in, on Bitrate's own artwork. In ui-react, `PlayIcon` and `SavedSongIcon` default to Bitrate purple instead of Spotify green, the Storybook stories use Bitrate album covers instead of four Spotify advertising posters, and unused payment-method icons were removed. web-player no longer serves those posters from `/images/banner-*.jpg`.
