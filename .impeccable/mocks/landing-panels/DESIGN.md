---
name: Bitrate landing panels
description: Scoped Pencil decisions for the hero typography and two following screens.
typography:
  hero:
    fontFamily: Bricolage Grotesque
    fontSize: 72px
    fontWeight: 700
    letterSpacing: -2.1px
  listener-heading:
    fontFamily: Bricolage Grotesque
    fontSize: 80px
    fontWeight: 700
  artist-heading:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: 700
  body:
    fontFamily: Hanken Grotesk
---

## Overview

This record applies to `pencil/web-player-disign/web-player.pen`: hero `EqoRn`,
listener screen `bcW65`, and artist workspace `U4M5L`. The approved direction
combines dark violet scenery with detailed inset interfaces. It does not redefine
the application's global design system.

## Colors

Copy-only color edition: user-created duplicate `w4YxPF` has a stronger chapter
palette and one global header. Original frames and masters are unchanged.
The separate decision record is `../landing-copy-color/BRIEF.md`; do not apply
its enlarged color fields or hidden header visibility to the original edition.

2026-09-06: owner requested secondary and semantic colors from the brand board.
Pencil board `V6EMrd` (02B • Extended Color / Semantic Palette) adds the exact
blue, green, amber and red 50–950 ramps from `palette.css`; existing base tokens
remain unchanged. New theme-aware `color-{info|success|warning|error}-{text|surface|border}`
roles cover dark/light/dim. Blue supports secondary actions, local-file metadata
and discovery links; green confirms saved/approved/current/shared states; amber
marks pending decisions; red marks overdue tasks. Purple remains the primary
action/selection color; ordinary taste tags are not warnings. Status labels/icons
remain visible alongside color. New token-pair contrast was calculated: minimum
text/surface 5.78:1 and border/surface 3.07:1, not a whole-product accessibility
certification. Changes are Pencil-only, not a CSS/token implementation migration.

Dark violet imagery provides the shared atmosphere. Preserve existing Bitrate
identity and album artwork; no new global color tokens are established here.

## Typography

Bricolage Grotesque supplies expressive headings; Hanken Grotesk handles body and
UI text. Body copy uses 16–20px; dense illustrative UI uses 10–14px with larger
task headings. Native hero text and hidden source `Oglk8` use these fonts. The
approved raster tablet retains its embedded lettering. Clash Display was rejected
by Pencil as an invalid family.

## Layout

Both new screens are 1440×900 desktop compositions. The listener screen presents
playback, liked songs, and recents as three mini-interfaces. The artist workspace
uses a release toolbar, five-stage timeline, five summary tiles, pitch approval,
checklist, suggested actions, activity, version comparison, and readiness footer.
Responsive variants are not specified by these frames.

Playlist Workshop `RTtVs` extends this system at 1440×900: a 48px left editorial
heading beside a four-step application window. The Tune step contains a goal,
five reorderable candidate rows, five refinement sliders and three source
signals. Purple identifies the current step and Build draft action. Original
logo, covers and scenic background are reused. All workshop UI remains native
editable layers. This is a labeled concept, not a claim of working AI.

Screens 16–20 continue the same world as separate native 1440×900 Pencil
compositions: customization (`vmgcF`), library history (`IWhYu`), discovery graph
(`TmR3L`), listening room (`U32A0`), and timestamp community (`Z7izFq`). The library
breadcrumb distinguishes smart folder from playlist; phone transfer names its
target. The graph intentionally contains nine nodes: seven artists and two scenes.
Use the settled snapshots listed in `BRIEF.md`.

## Elevation & Depth

Final CTA + Footer `RM9DD` is a separate 1440×900 screen. Center the two-line
72px Bricolage headline, supporting copy and one Open web player action above
a violet horizon. The dome and audio spectrum are native editable geometry;
the large ellipse is intentionally cropped at the footer. Reuse the original
Bitrate logo and existing typography. No new generated assets or product claims.

Reuse the generated scenic background at
`pencil/web-player-disign/assets/experience-v1/background.png`. Its prompt is in
the sibling `.prompt.txt` and PNG metadata. Interface detail remains editable;
the previously approved hero tablet is raster artwork.

## Components

Use native Pencil layers for the new interfaces and Lucide icons. Label demo
data and the artist workspace concept; suggestions require artist approval and
signals become available after launch.

The listener expansion retains Bricolage Grotesque/Hanken Grotesk, the original
mark, existing covers and demo avatars. Native layers form controls, waveforms
and graph geometry. One built-in generated Luma Vale portrait,
`pencil/web-player-disign/assets/social-discovery-v1/luma-vale.png`, is shared by
graph and community; its exact prompt is saved alongside and embedded in PNG.
Asset scan reported zero missing images.

## Do's and Don'ts

- Do preserve the original logo and album art; keep removed hero benefits absent.
- Don't imply lossless playback, synchronization, real-user statistics, or commercial results.
- Do retain the final review disposition: ship both desktop screens; no material fixes.
- Do use the settled exports recorded in `BRIEF.md`; their review reported no visible-node clipping.
- Do retain screens 16–20's final disposition: ship at desktop-concept scope.
  Review found no unintended visible clipping; decorative horizons are intentionally
  cropped. No code, runtime or mobile validation occurred; the phone is illustrative.
