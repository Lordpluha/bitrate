# Bitrate for Artists — Dark Theme Design Pass

Updated: September 16, 2026.

The canonical product checklist and screen inventory live in
[`../web-artist-design/web-artist.md`](../web-artist-design/web-artist.md). This file records only
the dark-theme pass. The editable source of truth is `web-artist-dark.pen`.

## Direction

The dark theme is the expressive, high-contrast Bitrate surface. It uses near-black neutral
backgrounds, restrained purple action color, blue informational accents, semantic green/amber/red,
and music-production imagery as integrated texture. Images support hierarchy; they never reduce
text contrast or become decorative noise.

## Completed scope

- [x] Foundations and component masters, screens 00–08.
- [x] Shared application shell and sidebar collapse control.
- [x] Dashboard and dashboard state matrix.
- [x] Music Tracks and Releases, filters, pagination, and responsive layouts.
- [x] Create Release: Audio, Artwork, Details, Contributors, and Final Review.
- [x] Release workspace, reviewer feedback, tasks, delivery, and post-release.
- [x] Profile details, catalog/layout, save recovery, and verification concept.
- [x] Account, security, notifications, appearance, connected services, team, and safety.
- [x] Promotion overview, campaign creation, assisted draft, materials, paid setup, and reporting.
- [x] Analytics overview, drill-down, source/period controls, and data-state matrix.
- [x] Metadata, lifecycle/archive, multi-track ordering, global search, notification center, and
  lifecycle-aware row actions.
- [x] Desktop and mobile compositions for the product screens.
- [x] Unique music-related image inserts rather than repeating one background across screens.

## Dark-theme rules

- Use dark neutral surfaces for structure; reserve saturated purple for primary actions and active
  selection.
- Keep inserted imagery subtle enough that labels, controls, and table rows remain readable.
- Integrate an image with a card, header, waveform, table, or chart composition instead of placing
  it as an unrelated side decoration.
- Do not reuse the same insert on adjacent screens.
- Use low-poly or studio-equipment imagery only when it explains music, delivery, performance, or
  control-room context.
- Keep elevation restrained. Hierarchy comes from surface tone, borders, spacing, and local light,
  not large generic shadows.
- Status chips always include a label and, where useful, an icon.
- Demo values and unavailable integrations remain explicit.

## Responsive rules

- Desktop navigation may collapse; mobile navigation is an overlay with a visible close action.
- Dense tables become labelled rows or cards without dropping status, date, or primary action.
- Images crop to the content container and never create horizontal overflow.
- The same decision order must survive on mobile even when the visual composition changes.

## Remaining verification

- [ ] Product-owner visual approval.
- [ ] Runtime keyboard, focus, reduced-motion, contrast, and screen-reader QA after implementation.
- [ ] Tablet-width review in the implemented application.
- [ ] Validation of provider-specific and legal requirements against real contracts.

All interface labels, annotations, component names, and product-logic notes in the `.pen` source
must remain in English.
