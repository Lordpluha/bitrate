# Bitrate — Header + Hero V2

Date: 2026-09-05. Status: reviewable Pencil concept; awaiting owner feedback.

## Scope and authority

The owner rejected the preceding landing and narrowed the task to header + hero.
The new supplied screenshot is the visual authority: floating navigation, a large
left headline, a dominant violet-lit player on the right, cinematic dark scenery.
This iteration changes the Pencil canvas and its assets only. It does not claim
that the website implements this new direction or supersede the whole design system.

Sources of product truth: PRODUCT.md and apps/docs/docs/brand/brand.md.
The listener surface belongs to the broader Bitrate music ecosystem. No fabricated
testimonials, ratings, listener counts, pricing or artist results are included.

## Deliverable

- File: pencil/web-player-disign/web-player.pen
- Frame: EqoRn — 11 • Bitrate / Header + Hero / V2
- Size: 1440 × 1080
- Export: output/hero-v2/EqoRn.png
- Generated composition reference: header-hero-reference.png in this directory.
- Older frames retained for history; V2 is a new, clearly named root.

## Composition and materials

Floating header at 24 px inset; original Bitrate mark instance OVOcb, wordmark,
Web player, For artists, Features, Log in and Create account.
Manrope headline at 66 px, weight 600, three deliberate lines. Copy and buttons
remain independent text and frame layers. Purple accent appears on the last line.
The player has native editable queue rows, track text, sidebar, transport,
progress, volume and technical footer. A 3-degree tilt gives the product scene
movement while keeping interface labels legible. These are static design controls.
Three quiet listening benefits finish the first screen without card containers.

Generated assets: assets/hero-v2/stage.png and night-signal.png, relative to the
Pencil document. The stage supplies the optical ribbon, obsidian plinth and light;
it contains no UI or text. The album cover supplies an organic spectral petal.
Both are generated with the built-in image tool, stored locally, and carry exact
prompts in sibling .prompt.txt files and embedded metadata. Existing demo queue
artwork is reused from the preceding landing assets.

## Verification

Inspected the real 1440 × 1080 Pencil export, not only the generated reference.
Resolved the active-navigation underline width and seek-time bounds. A separate
visual reviewer requested larger queue and benefit text; those labels were raised
to 14 px, artists to 12 px and benefit icons to 30 px. Pencil bounds checks run
after those corrections. No application code changed or application tests needed
for this canvas-only iteration.

## Revision — dimensional tablet (2026-09-05)

Owner requested a genuinely dimensional tablet rather than a rotated flat panel.
The visible presentation now uses `assets/hero-v2/tablet-scene-3d.png`, generated
with the built-in imagegen tool from the exported native player and existing stage.
Perspective, a visible graphite sidewall, beveled glass, rim highlights and a
contact shadow provide depth. Header, copy, original logo, CTAs and benefits are
unchanged native layers. `Oglk8` retains the complete editable source UI, hidden
behind presentation layer `CTMCC`; it was not deleted. The visible tablet UI is
raster artwork, not separately editable controls or a real 3D model.

Intermediate `tablet-3d.png` has an opaque checkerboard background and is not used
in the canvas. Final compositing removes it. Exact generation prompts are saved
beside both images as `.prompt.txt`. Final canvas export:
`output/hero-v2/tablet-3d/EqoRn.png`. Previous export remains for before/after.
Canvas-only revision; no site code changed.

## Next boundary (unchanged)

First agree on the visual character of this first screen. Additional sections,
responsive variants and transferring V2 into the website are subsequent work.
The product-owner concepts for customization and playlist questionnaires remain
recorded in PRODUCT.md; they have not been discarded.
