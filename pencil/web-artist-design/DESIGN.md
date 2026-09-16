---
name: Bitrate for Artists — Pencil
description: Visual system for static Bitrate artist-workspace designs.
colors:
  color-primary: "#7C3AED"
  color-accent: "#A78BFA"
  color-background: "#0B0D12"
  color-card: "#151923"
  color-border: "#2A303C"
  color-text: "#FFFFFF"
  color-text-secondary: "#9CA3AF"
typography:
  body:
    fontFamily: Poppins
  label:
    fontFamily: Poppins
    fontSize: "14px"
    fontWeight: 600
rounded:
  card: "12px"
spacing:
  stack: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.color-primary}"
    textColor: "{colors.color-text}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0px 18px"
  card:
    backgroundColor: "{colors.color-card}"
    rounded: "{rounded.card}"
---

# Design System: Bitrate for Artists — Pencil

## Overview

**Creative North Star: Inherited Bitrate System**

A calm production workspace with neutral structure, recognizable purple actions, explicit status,
and a clear next step. Artwork and music-production imagery carry personality; the interface helps
the artist manage work without competing with the music.

This document describes the system used by the static designs in this directory. It is not a new
brand identity and it is not proof of implemented behavior. `web-artist.pen` is the source of truth
for variables, masters, instances, layouts, and annotations. Dim is the primary neutral theme;
dark is the higher-contrast alternative; light is the bright alternative.

Key characteristics:

- Neutral surfaces and disciplined purple actions.
- One coherent type hierarchy and moderate information density.
- Status always includes a readable label; absent data is stated explicitly.
- Mobile preserves content, decision order, and the next action.
- Demo data and unavailable integrations are labelled honestly.

See [web-artist.md](web-artist.md) for screen inventory, product logic, and QA status.

## Colors

- **Primary:** `color-primary` for the main action and active selection;
  `color-accent` for supporting links and secondary emphasis.
- **Neutral:** `color-background` for the canvas, `color-card` for panels,
  `color-border` for structure, `color-text` for primary content, and
  `color-text-secondary` for metadata.
- **Semantic:** success, warning, error, and information use the corresponding semantic variables
  defined in the `.pen` source.

**Status rule:** communicate state through a label and, when useful, an icon. Color reinforces the
message but never carries it alone.

## Typography

Poppins is the inherited interface family for this neutral source. Hierarchy runs from page title
to release title, section title, body, label, and metadata. Button labels use stronger weight.
Exact display sizes and weights remain in the Pencil variables and masters; this file does not
create a second global scale.

All interface copy, component names, annotations, and product-logic notes are English. Language
selection in a static mockup does not imply runtime localization.

## Layout

- Desktop separates persistent navigation, top bar, primary workspace, and supporting context.
- Use a wider primary column when one task owns the page; supporting cards must not compete with
  the main action.
- Mobile uses a single decision-oriented column and a modal navigation panel.
- Tables become labelled rows or cards while retaining status, dates, ownership, and actions.
- Filters, active sorting, applied scope, reset, and pagination remain visible around the result.
- Images and media crop inside their containers and never create horizontal overflow.
- Intermediate breakpoints must be verified in the implemented application.

## Elevation and depth

Create hierarchy through surface tone, one-pixel borders, spacing, and local contrast before using
shadow. Large navigation regions, tab bars, and page containers should not appear to float above
the product. Overlays may use a scrim and focused elevation, but must define close, Escape,
click-away, focus-return, and scroll-lock behavior for implementation.

## Shapes

- Cards use the shared `rounded.card` radius.
- Primary actions may use a pill shape when consistent with the component master.
- Artwork and inserted imagery are clipped by their content bounds.
- Straight separators support scan-heavy tables and lists.
- Control radii come from masters rather than being inferred from individual screens.

## Components

- **Primary button:** one dominant action per decision context. A global action becomes secondary
  when a local task already owns the primary emphasis.
- **Secondary button:** outline or neutral surface for reversible or supporting actions.
- **Status chip:** semantic label with consistent icon, padding, and vertical alignment.
- **Card:** groups one task or one coherent set of information; it is not a generic decorative tile.
- **Tabs:** centered labels, balanced padding, clear active state, and no layout jump.
- **Table/list:** stable columns on desktop, labelled rows on mobile, and lifecycle-aware actions.
- **Form field:** required, optional, read-only, focused, invalid, saving, and saved states are
  distinct before the user enters data.
- **Upload:** ready, drag-active, uploading, processing, complete, and recoverable-error states.
- **Modal/sheet:** names the exact object and consequence; destructive confirmation remains separate
  from routine actions.
- **Search:** keeps query and scope visible and distinguishes selected preview from navigation.
- **Notification:** includes event, object, time, state, and next action.
- **Media insert:** explains music or production context and must not reduce content contrast.

## Responsive behavior

- Keep the same information and next action across desktop and mobile.
- Recompose rather than scale down.
- Use full-width mobile actions only when they improve the decision path.
- Keep safe touch targets and visible focus requirements in the implementation handoff.
- Do not place text over a busy image without a controlled fade or solid reading surface.

## Accessibility and integrity

- Target WCAG 2.2 AA in implementation.
- Never rely on color alone.
- Preserve keyboard order and visible focus.
- Respect reduced motion.
- Use real labels and accessible names for icon-only controls.
- Distinguish zero, no data, delayed data, and load error.
- Distinguish draft save, internal review, approval, Bitrate publication, and external delivery.
- Never present illustrative numbers, people, integrations, or AI output as live product data.

## Do and do not

Do:

- Reuse variables, component masters, and original brand assets from the `.pen` source.
- Preserve content hierarchy and status meaning during adaptation.
- Label demo and unavailable states.
- Keep music imagery specific to the screen's task.
- Verify the implementation separately from the static design.

Do not:

- Replace the neutral workspace with an undifferentiated neon scene.
- Invent provider limits, legal promises, performance data, or revenue.
- Use the same decorative image across unrelated screens.
- Treat static hover/focus examples as proof of runtime accessibility.
- Apply one theme's literal values to another theme.
