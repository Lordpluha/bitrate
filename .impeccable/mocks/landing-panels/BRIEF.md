# Bitrate — landing section extensions

Date: 2026-09-05. Medium: Pencil only. Mode: Persuade.

## Confirmed boundary

Owner clarified font changes apply to the current hero in Pencil, not the entire
design system or application code. Two following blocks are standalone screens:
the listener loop and an artist release workspace. References supplied in chat
pin dark violet scenery, detailed inset interfaces, and the workspace topology.
The owner then requested economical execution: reuse assets and avoid variants.

## Typography

Bricolage Grotesque is the display face; Hanken Grotesk is the UI/body face.
Hero display: 72/700, tracking -2.1; listener heading: 80/700; artist heading:
48/700. Body: 16–20. Dense illustrative UI uses 10–14 with larger task headings.
Clash Display was tested and rejected by Pencil as an invalid family; no font
fallback is presented as the requested font. Fontshare, Fonts In Use, Displaay
and Pangram Pangram were explored as references, not copied or purchased.

Hero's native text and hidden UI source use the new fonts. The already approved
3D tablet is raster artwork and its embedded lettering is unchanged. Native
editable source remains in Oglk8; do not claim the raster uses exact font files.

## Screens and proof

- RTtVs: 14 • Bitrate / Playlist Workshop, 1440×900. Added 2026-09-05 from
  owner screenshot using the same economical, reuse-first workflow. Left story;
  right workshop with four steps, goal, five ranked candidates, refinement
  sliders and source signals. Tune is active because ranking/refinement is
  visible. No fabricated match percentages. Export:
  output/playlist-workshop-v1/RTtVs.png. All UI is native editable Pencil.
  Reuses the original mark, existing covers and experience-v1 background;
  no new generation or application code. Concept/demo labels remain visible.

- EqoRn: existing header/hero, typography updated. User-removed benefits remain
  removed. Export: output/landing-type-refresh/EqoRn.png.
- bcW65: 12 • Bitrate / Play. Save. Return., 1440×900. Three mini-interfaces:
  playback, liked songs and recents. Export: output/landing-type-refresh/bcW65.png.
- U4M5L: 13 • Bitrate / Artist Release Workspace, 1440×900. Release toolbar,
  five-stage timeline, five summary tiles, pitch approval focus, checklist,
  suggested next steps, activity, version comparison and readiness footer.
  Export: output/artist-release-v1/U4M5L.png.

All interfaces except the previously approved 3D hero tablet are native editable
layers. Icons are Lucide. Original Bitrate logo and existing album art preserved.
Generated background shared by both new screens:
pencil/web-player-disign/assets/experience-v1/background.png. Exact prompt is
in the sibling .prompt.txt and PNG metadata; built-in imagegen used.

## Product truth

PRODUCT.md and apps/docs/docs/brand/brand.md govern copy. Demo data is labeled.
No lossless, uninterrupted playback, cross-platform sync, real-user statistics
or commercial results are asserted. Artist workspace is labeled a concept;
signals become available after launch, and suggestions need artist approval.
No application code, global design system or archive frames changed.

## Verification

Color extension on 2026-09-06: board `V6EMrd`, 02B • Extended Color / Semantic
Palette, extends the existing Color board without moving existing screens.
57 missing variables added (44 primitive swatches, 12 themed semantic roles,
one secondary-action role). Existing base semantic colors were already present
and were preserved. Meaningful accents on current landing screens now reference
these roles. Screenshot: `output/semantic-color-v1/V6EMrd.png`; calculated pairs:
`output/semantic-color-v1/contrast-check.json`. Semantic badges, blue secondary
actions and relevant statuses were visually checked; no code changes.

## Listener expansion — 2026-09-06

Owner supplied four pinned screenshots and requested sequential, economical,
Pencil-only execution without questions. Existing screens and website code stay
untouched. Persuade mode; each new screen is a separate native 1440×900 frame.

- `vmgcF` — 16 • Your Player. Your Rules. Previous request completed: layout
  presets, visible blocks, density, preview and floating queue/drop targets.
  Snapshot: `output/custom-ui-v1/vmgcF.png`.
- `IWhYu` — 17 • A Library With A Memory. Smart folders, tags, search filters,
  local music and playlist version restore. Sources limited to Bitrate / Local
  file; no third-party streaming integrations or storage quota claims.
  Snapshot: `output/library-memory-v1/IWhYu.png`.
- `TmR3L` — 18 • Follow The Sound. Fictional artist relationship map, three
  labeled connection categories, artist detail and explored route.
  Snapshot: `output/discovery-graph-v1/TmR3L.png`.
- `U32A0` — 19 • Same Queue. New Scene. Shared queue with contributor attribution,
  queue permissions, phone preview and separate device output switcher.
  Snapshot: `output/listening-room-v1/U32A0.png`.
- `Z7izFq` — 20 • Beyond The Play Button. Friend taste history, timestamped
  waveform comments and artist reply. Afterglow duration is consistently 4:02.
  Snapshot: `output/track-conversation-v1/Z7izFq.png`.

Concept/demo labels distinguish these proposals from shipped capabilities.
One new generated portrait is reused for fictional Luma Vale in the graph and
discussion: `pencil/web-player-disign/assets/social-discovery-v1/luma-vale.png`.
Built-in image_gen used; exact prompt saved alongside and embedded in PNG.
Existing cover art, original logo and demo avatars reused. Native geometry
supplies the map, waveforms and controls. Final screenshot review is separate
from runtime/accessibility verification; no app code was changed.

## Earlier-screen verification

Final screen added: `RM9DD` — 15 • Bitrate / Final CTA + Footer, 1440×900,
positioned after Playlist Workshop. Native CTA, spectrum, horizon and footer;
original logo preserved. Export: `output/final-cta-v1/RM9DD.png`. Full-resolution
snapshot checked; decorative ellipse intentionally cropped to form the horizon.

Actual exports opened at full resolution. Bounds checks performed after layout
settled, with no visible-node clipping reported in either new screen. Initial
immediate exports can show transient dim/clipped freshly inserted text; final
exports must be checked after settlement. Web lint/build not applicable to .pen.
