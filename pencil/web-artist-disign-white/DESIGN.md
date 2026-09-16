---
name: Bitrate for Artists — Light System
description: Bright visual system for the Bitrate artist workspace.
colors:
  color-primary: "#6D28D9"
  color-on-primary: "#FFFFFF"
  color-accent: "#2563EB"
  color-background: "#F6F7FB"
  color-card: "#FFFFFF"
  color-border: "#D6DEEB"
  color-text: "#151826"
  color-text-secondary: "#566074"
typography:
  body:
    fontFamily: Manrope
  display:
    fontFamily: Space Grotesk
  label:
    fontFamily: Manrope
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
    textColor: "{colors.color-on-primary}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0px 18px"
  card:
    backgroundColor: "{colors.color-card}"
    rounded: "{rounded.card}"
---

# Design System: Bitrate for Artists — Light

## Overview

**Creative North Star: Luminous Studio**

The light system is a bright production workspace with a soft paper-like canvas, cool technical
surfaces, precise violet/cobalt signals, and occasional dark media plates. White is not empty
space: hierarchy comes from tonal steps, borders, typography, and restrained spectral detail.

`web-artist-white.pen` is the source of truth for light variables, masters, instances, layouts,
and annotations. The canonical product inventory lives in
[`../web-artist-design/web-artist.md`](../web-artist-design/web-artist.md). Dark and dim are separate
token branches; light values must not be copied into them literally.

## Color and contrast

- `color-background` is the page canvas; `color-card` is the primary working surface.
- `color-primary` owns the main action and active selection.
- `color-accent` supports information, links, and secondary navigation.
- Semantic green, amber, red, and blue use light tints with readable text and borders.
- Dark panels are reserved for artwork or playback when media focus benefits from them.
- Avoid full purple content cards; use lavender selection tints instead.
- Status always includes a readable label and, when useful, an icon.

## Typography

Space Grotesk is reserved for large display statements. Manrope carries controls, body copy, data,
labels, and metadata. Use a stable hierarchy and tabular treatment for time or dense metrics where
the source system provides it. All interface copy, component names, annotations, and product-logic
notes must be English.

## Layout and depth

- Separate navigation, command bar, primary task, and supporting context.
- Use borders, tonal layers, and spacing before shadow.
- Shadows are soft and local; sidebars, tab bars, and page regions must not float above the entire
  interface.
- Tabs use centered labels, balanced padding, and stable active geometry.
- Table separators use subtle neutral borders rather than dark full-width rules.
- Cards group one task or coherent evidence set.

## Music inserts

- Connect each insert to the task: waveform for audio, proofing table for artwork, patchbay for
  delivery, console for rights or campaign control, and spectrum for analytics.
- Use different imagery for different workflows instead of repeating one background.
- Background imagery may be visible, but must sit beneath a controlled white fade or reading
  surface so labels and controls remain clear.
- Remove or soften decorative layers on mobile when they compete with forms or dense data.
- Crop every insert inside its component and prevent horizontal overflow.

## Components

- **Primary action:** violet fill with white on-primary text and one clear owner per context.
- **Secondary action:** neutral or outlined; it supports rather than competes.
- **Status chip:** semantic tint, complete label, consistent icon alignment, and sufficient width.
- **Table/list:** stable desktop columns, subtle separators, and labelled mobile rows.
- **Form:** required, optional, read-only, focus, error, saving, and saved states.
- **Upload:** ready, drag-active, uploading, processing, complete, and recoverable error.
- **Dialog/sheet:** exact object and consequence, safe default focus, and a separate destructive
  confirmation path.

## Responsive behavior

- Mobile is a true single-column composition, not desktop geometry scaled down.
- The navigation panel overlays content and has close, Escape, click-away, focus-return, and
  scroll-lock requirements for implementation.
- Preserve status, date, ownership, and action when tables become cards or rows.
- Use full-width actions only when they improve the decision flow.
- Keep imagery, fades, and content inside card bounds.

## Accessibility and product integrity

- Target WCAG 2.2 AA during implementation.
- Keep visible keyboard focus and logical reading order.
- Respect reduced motion.
- Distinguish zero, no data, delayed data, and load error.
- Distinguish draft save, internal review, approval, Bitrate publication, and external delivery.
- Label demo values and unavailable integrations.
- Do not invent provider limits, legal fields, performance data, or revenue.
- Static designs specify intent; they do not prove runtime behavior.

## Do and do not

Do reuse light variables, masters, and original brand assets. Do use quiet borders and tonal layers
for structure. Do keep one clear next action. Do make music imagery relevant to the workflow.

Do not leave dark-theme surfaces in forms or tables, use heavy generic shadows, turn an entire
working card purple, place readable content directly over busy imagery, or treat light-theme values
as replacements for dark and dim tokens.
