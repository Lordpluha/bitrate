# Bitrate for Artists — Application Design Plan

Updated: September 16, 2026.

This is a checklist for static product designs, not a list of shipped features. A checked item
means the relevant Pencil frames were prepared and structurally reviewed. It does not imply that
the behavior exists in the application. Runtime accessibility, integration behavior, and final
product-owner approval are tracked separately.

The editable source of truth is `web-artist.pen`. All interface copy and all design annotations
must be in English.

## 1. Product goal and boundaries

Help an independent artist move from a finished track to release preparation, promotion, and
performance review. Every surface must answer three questions: what is happening, what should the
artist do next, and what is blocking progress?

- Preserve Bitrate's existing palette, typography, components, spacing, and original logo assets.
- Treat dark, light, and dim as one token-driven system. Dim is the primary neutral theme; dark is
  the higher-contrast alternative; light is the bright alternative.
- Keep demo data, concepts, planned integrations, and unavailable functions explicitly labelled.
- Do not imply that Bitrate has delivered content to an external service unless a confirmed public
  URL or provider response exists.
- Do not invent delivery limits, legal requirements, revenue, or provider capabilities.
- Separate the artist's public profile from private account, login, security, and billing data.
- Design desktop and mobile compositions as peers. Mobile is not a compressed desktop canvas.

## 2. Shared shell and design system

- [x] Preserve foundations, semantic colors, typography, components, states, and theme variables.
- [x] Provide navigation for Dashboard, Music, Promotion, Analytics, Profile, and Settings.
- [x] Provide a collapsible desktop sidebar and a modal mobile navigation panel.
- [x] Cover search, notifications, account menu, filters, tables, tabs, upload, confirmation, and
  row-action patterns.
- [x] Distinguish selection, information, success, warning, and error with text and icons in
  addition to color.
- [x] Preserve content hierarchy, primary actions, and status explanations at narrow widths.
- [ ] Validate keyboard behavior, focus return, scroll locking, measured contrast, reduced motion,
  and intermediate tablet widths in the implemented product.

Core frames:

- `pNeG9` — application shell, desktop.
- `R5LDZj` — mobile shell, menu closed.
- `aA6Id` — mobile shell, menu open.
- `H3Itmt` — shared interface patterns and semantic states.

## 3. Dashboard

- [x] First-run state with one clear action: create the first release.
- [x] Returning-artist state with current release, status, next task, and blocking feedback.
- [x] Needs-attention, catalog, upcoming dates, recent activity, and analytics availability.
- [x] State matrix for first run, all clear, collecting data, loading, and recoverable error.
- [x] Preserve the decision order on mobile: current work, required actions, catalog, dates,
  activity, then analytics.

Frames:

- `L017Y` / `bu2rk` — returning dashboard, desktop/mobile.
- `tWPhZ` — dashboard state matrix.
- `tm3ER` / `RBGCQ` — final dashboard summary, desktop/mobile.
- `O45LSf` — cross-theme and interaction QA matrix.

## 4. Music catalog

- [x] Tracks and Releases as two views of the same catalog.
- [x] Search, sorting, status/type filters, reset, applied filters, and empty results.
- [x] Track table with artwork, version, duration, status, update time, release, and row actions.
- [x] Inline playback that does not navigate away from the current list.
- [x] Release table with Single, EP, and Album types, track count, dates, and status.
- [x] Pagination with compact mobile rows and equivalent information.
- [x] Metadata editing, archive rules, and multi-track ordering states.

Definitions:

- A **track** is one audio recording and its versions.
- A **release** is the publication container: track list, artwork, title, contributors, rights,
  planned date, and status.
- A **Single** focuses on one primary track; an **EP** is a short multi-track release; an
  **Album** is a larger, cohesive track list.

Frames:

- `DhsgM` / `JZHt8` — Tracks, desktop/mobile.
- `dg76H` / `oWM3u` — Releases, desktop/mobile.
- `mDs8D` — open filter, applied-filter, and empty-result states.
- `Ehnte` / `Y2k3a` — metadata editing, desktop/mobile.
- `Lwatu` / `RlAV8` — archive and lifecycle states, desktop/mobile.
- `M0sfEp` / `g0Lz3` — EP/Album ordering, desktop/mobile.

## 5. Create release

The wizard is one draft with five steps: Audio, Artwork, Details, Contributors, and Review. Saving
a draft never publishes or submits it. Progression is gated only by confirmed requirements.

- [x] Audio selection for Single, EP, and Album.
- [x] Upload states: ready, drag-active, uploading, processing, recoverable error, and complete.
- [x] Artwork upload with draft preservation and honest validation requirements.
- [x] Public title, version, explicit status, genres, required/optional fields, and save recovery.
- [x] Contributors, roles, rights confirmations, blockers, and ownership changes.
- [x] Final review with exact edit links, readiness summary, submit/error/success states, and a
  clear boundary between internal Bitrate review and external delivery.

Frames:

- `y4r5Lx` / `mP3EG` — Audio, desktop/mobile.
- `fuFvh` — upload state matrix.
- `aISEQ` / `iW0o7` — Artwork, desktop/mobile.
- `nygmf` / `g9VtYR` — Details, desktop/mobile.
- `YkHj6` — detail-field and save states.
- `ojDoL` / `V5qAC` — Contributors and Rights, desktop/mobile.
- `JYEaf` — contributor and rights states.
- `gK5Ae` / `FgB5s` — Final Review, desktop/mobile.
- `Z8Pcr` — final-submission states.

## 6. Release workspace and delivery

- [x] Review-in-progress workspace with status, next action, feedback, timeline, readiness,
  current master, previous versions, and activity.
- [x] Changes-requested flow with required changes, optional recommendations, replies, resolution,
  saving, resubmission, and recoverable error.
- [x] Tasks with owners, deadlines, timezone, filters, and review blockers.
- [x] Delivery plan with explicit Not connected, Pending, and Unavailable provider states.
- [x] Submission readiness that states when nothing has been sent yet.
- [x] Post-release view separating Bitrate publication from external destinations.

Frames:

- `EvWT5` / `mf4LZ` — release workspace, desktop/mobile.
- `F89st` — review state matrix.
- `dMPfF` / `U2eW4A` — reviewer feedback, desktop/mobile.
- `r9U1c` — feedback and resubmission states.
- `vvFQO` / `IXDcH` — release tasks, desktop/mobile.
- `W8wV8` / `tZ48E` — delivery plan, desktop/mobile.
- `i8mjf0` / `mqtop` — delivery status, desktop/mobile.
- `wMMpY` / `MMKvM` — post-release, desktop/mobile.

## 7. Promotion

- [x] Promotion overview with Draft, Scheduled, Active, Paused, and Completed campaign states.
- [x] Campaign creation based on release, goal, audience, channels, timing, and materials.
- [x] AI-assisted draft constrained by the artist's brief, release metadata, and selected tone.
- [x] Editable generated copy, preserved variants, regeneration, and separate final approval.
- [x] Materials and calendar with channel preview, destination, timezone, and scheduling.
- [x] Paid setup with demo budget, daily cap, billing/provider blockers, maximum-spend review,
  auto-renew state, and explicit consent.
- [x] Report and recovery with source, definition, period, timezone, freshness, unavailable
  external metrics, and retry without duplicate publication.

Frames:

- `nEVZv` / `eY3tU` — promotion overview, desktop/mobile.
- `DKSYY` / `Z0TTDf` — campaign creation, desktop/mobile.
- `HZ3XZ` / `QGs6i` — AI-assisted draft, desktop/mobile.
- `w3Y3FF` / `k5rtxH` — materials and calendar, desktop/mobile.
- `dubJG` / `Gg2gt` — paid setup, desktop/mobile.
- `pSqbU` / `icBrr` — report and recovery, desktop/mobile.

## 8. Analytics

- [x] Overview for confirmed Bitrate-owned signals.
- [x] Release/track drill-down that updates all cards and tables within one context.
- [x] Shared period, comparison, source, timezone, completion, and freshness definitions.
- [x] Distinct Observed zero, No data yet, Delayed, and Load error states.
- [x] Legends, value labels, and a tabular alternative to charts.
- [x] External services displayed as Not connected or unavailable, never as fabricated zeroes.
- [ ] Revenue and forecasting remain future concepts; estimates must never be presented as facts
  or guarantees.

## 9. Artist profile

- [x] Public image, cover, display name, handle, bio, and external links.
- [x] Featured release selected from the published catalog.
- [x] Public-profile block ordering and visibility saved as one layout draft.
- [x] Preview that does not imply the draft has been saved.
- [x] Save recovery, field-level errors, retry/cancel, and verification concept states.
- [x] Verification states: Not applied, Submitted, Needs information, and Approved.

Frames:

- `E8FXx` / `bo6y5` — profile details, desktop/mobile.
- `umRNn` / `m2TMzU` — catalog and layout, desktop/mobile.
- `NWNpZ` / `fkSss` — save and verification, desktop/mobile.

## 10. Settings

- [x] Account identity separated from the public artist profile.
- [x] Password, 2FA, recovery codes, active sessions, and consequence-aware confirmations.
- [x] Notification categories split into In-app, Email, and Push channels.
- [x] Appearance controls for dark/light/dim, density, and reduced motion.
- [x] Connected-service states, permissions, disconnect review, and delivery boundary.
- [x] Team roles, pending invitations, ownership restrictions, sign-out, deactivation, and account
  deletion review.
- [ ] Runtime localization is not implemented; the language selector remains unavailable.

Frames:

- `h6L41N` / `uKCn1` — Account, desktop/mobile.
- `bxxmR` / `E5mFT5` — Security, desktop/mobile.
- `nPhsF` / `grIwc` — Notifications, desktop/mobile.
- `l0AdPz` / `U686R` — Appearance, desktop/mobile.
- `finkk` / `oP5z6` — Connected Services, desktop/mobile.
- `Urz87` / `a4Qsh` — Team and Safety, desktop/mobile.

## 11. Global interaction surfaces

- [x] Global search across releases, tracks, campaigns, tasks, and settings.
- [x] Notification center with action-required separation, timestamps, unread treatment, and
  non-destructive mark-as-read behavior.
- [x] Context actions that depend on object lifecycle and keep permanent deletion separate from
  routine actions.
- [x] Mobile bottom-sheet equivalent for row actions.
- [x] Consequence-aware state matrix for draft deletion, review withdrawal, published archive,
  retry, and unavailable actions.

Frames:

- `ZvVcc` / `FTtu0` — global search, desktop/mobile.
- `n92Mi` / `a39Ou` — notification center, desktop/mobile.
- `EKQj7` — row-context actions and consequence rules.

## 12. QA and handoff rules

Every screen must be checked for:

- English-only interface copy and annotations.
- Desktop/mobile content parity and no clipped content.
- Default, hover, focus, pressed, disabled, loading, empty, success, warning, and recoverable-error
  states where relevant.
- Long titles, missing artwork, large values, and narrow widths.
- One clear primary action per decision context.
- Status meaning conveyed by text and icon, not color alone.
- Demo labels on illustrative numbers, dates, links, people, and integrations.
- Honest separation of save, review, approval, publication, and external delivery.

Static source audit: 95 variables, 44 reusable components, 215 instances, 13 unique component
targets, no broken references, 89 bound variables, no unknown variable references, and no
unfinished root placeholders. Static review does not replace browser accessibility or integration
testing.

## 13. Remaining work

- [ ] Product-owner review of the complete artist workspace.
- [ ] Runtime keyboard, focus, screen-reader, contrast, motion, and tablet-width QA.
- [ ] Confirm external delivery formats, limits, legal fields, and provider state models when the
  implementation contracts exist.
- [ ] Validate copy and behavior against the implemented backend before shipping.
- [ ] Start future concepts only through a separate approved scope.

Future concepts outside the current core scope include marketplace/services, career timeline,
community plugins, AI A&R, and opt-in workflow automation. They must not be presented as shipped.

See `DESIGN.md` for the visual-system handoff. Application code was not changed as part of this
Pencil design pass.
