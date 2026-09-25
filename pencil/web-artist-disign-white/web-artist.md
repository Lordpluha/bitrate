# Bitrate for Artists — Light Theme Design Pass

Updated: September 16, 2026.

The canonical product checklist and screen inventory live in
[`../web-artist-design/web-artist.md`](../web-artist-design/web-artist.md). This file records only
the light-theme pass. The editable source of truth is `web-artist-white.pen`.

## Direction

The light theme is a bright production workspace, not an inverted dark mockup. It uses clean
neutral surfaces, restrained lavender selection, purple primary actions, readable semantic color,
and subtle music-production imagery. Cards remain visually grounded without heavy shadows.

## Completed scope

- [x] Light foundations and component masters, screens 00–08.
- [x] Shared shell, sidebar collapse control, and mobile navigation.
- [x] Dashboard and dashboard states.
- [x] Music Tracks and Releases, filters, pagination, and responsive layouts.
- [x] Create Release: Audio, Artwork, Details, Contributors, and Final Review.
- [x] Release workspace, reviewer feedback, tasks, delivery, and post-release.
- [x] Profile details, catalog/layout, save recovery, and verification concept.
- [x] Account, security, notifications, appearance, connected services, team, and safety.
- [x] Promotion and campaign workflow.
- [x] Analytics, metadata, lifecycle/archive, track ordering, search, notifications, and row
  actions.
- [x] Desktop and mobile compositions for the complete product set.

## Light-theme rules

- Use white and cool-neutral surfaces for hierarchy; do not leave dark-theme panels in the light
  composition unless the content itself is media.
- Use borders and small tonal differences before adding elevation.
- Shadows must be soft and local. The sidebar, tab bars, and large page regions must not appear to
  float above everything else.
- Keep primary purple for the main action and active selection; avoid full purple content cards.
- Background imagery may be more visible than a watermark, but must not reduce table or form
  readability.
- Table separators use subtle neutral borders, not dark full-width rules.
- Status chips use semantic tints with readable labels and consistent vertical alignment.
- Tabs and segmented controls must have balanced padding and centered labels.
- Demo values and unavailable integrations remain explicit.

## Responsive rules

- Mobile uses a true single-column hierarchy; it must not retain desktop overlay geometry.
- Cards, media, and background inserts crop inside their own bounds.
- Actions become full width only when that improves the decision flow.
- Tables become labelled rows or cards without dropping status, date, or primary action.
- The same decision order must survive on mobile even when visual grouping changes.

## Remaining verification

- [ ] Product-owner visual approval.
- [ ] Runtime keyboard, focus, reduced-motion, contrast, and screen-reader QA after implementation.
- [ ] Tablet-width review in the implemented application.
- [ ] Validation of provider-specific and legal requirements against real contracts.

All interface labels, annotations, component names, and product-logic notes in the `.pen` source
must remain in English.
