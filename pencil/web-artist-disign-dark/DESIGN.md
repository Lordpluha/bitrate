---
name: Bitrate for Artists — Dark System
description: High-contrast dark visual system for the Bitrate artist workspace.
colors:
  color-primary: "#7C3AED"
  color-accent: "#A78BFA"
  color-background: "#080A0F"
  color-card: "#111620"
  color-border: "#283244"
  color-text: "#F8FAFC"
  color-text-secondary: "#A7B0C2"
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

# Design System: Bitrate for Artists — Dark

## Overview

**Creative North Star: Midnight Control Room**

The dark system is an expressive, high-contrast production workspace. Near-black neutral layers
create structure; purple identifies the main action and active selection; blue, green, amber, and
red communicate semantic state. Studio equipment, waveforms, spectral forms, and low-poly music
objects add context without turning the application into a decorative scene.

`web-artist-dark.pen` is the source of truth for local variables, masters, instances, layouts, and
annotations. The canonical product inventory lives in
[`../web-artist-design/web-artist.md`](../web-artist-design/web-artist.md).

## Color and contrast

- Use `color-background` for the page canvas and `color-card` for working surfaces.
- Use `color-primary` for one dominant action per decision context.
- Use `color-accent` for links, supporting emphasis, and selected detail.
- Keep neutral body text readable before adding glow or image texture.
- Semantic status uses both a label and an icon where useful; color never acts alone.
- Demo, unavailable, pending, and error states remain visually and verbally distinct.

## Typography

Poppins carries interface hierarchy from display title to section title, body, label, and metadata.
Use weight and spacing before introducing additional type styles. All interface copy, component
names, annotations, and product-logic notes must be English.

## Layout and depth

- The shell separates navigation, command bar, primary task, and supporting context.
- Use surface differences, borders, and spacing before shadow.
- Purple glow is local to active controls or meaningful music media; it is not a page-wide effect.
- Cards group work and evidence rather than acting as independent promotional tiles.
- Tabs have centered labels and stable geometry.
- Tables use quiet separators and lifecycle-aware row actions.

## Music inserts

- Connect each insert to the screen's task: waveform for audio, proofing surface for artwork,
  patchbay for delivery, console for contributors or campaign control, and spectrum for analytics.
- Avoid repeating one insert on adjacent screens.
- Integrate imagery with a header, card, chart, player, or table instead of leaving it as an
  unrelated side strip.
- Use a controlled fade beneath text and controls.
- Preserve image crop inside the component at every breakpoint.

## Components

- **Primary action:** saturated purple with readable on-primary text.
- **Secondary action:** neutral or outlined; never competes with a local primary action.
- **Status chip:** compact, aligned, and wide enough for its full label.
- **Table/list:** stable columns on desktop and labelled content rows on mobile.
- **Form:** required, optional, read-only, focus, error, saving, and saved states.
- **Upload:** ready, drag-active, uploading, processing, complete, and recoverable error.
- **Dialog/sheet:** exact object, exact consequence, safe default focus, and a separate destructive
  confirmation path.

## Responsive behavior

- Desktop navigation can collapse through the control beside the logo.
- Mobile navigation is an overlay with close, Escape, click-away, focus-return, and scroll-lock
  requirements for implementation.
- Recompose to one decision-oriented column; do not scale the desktop canvas.
- Preserve status, date, ownership, and action when tables become mobile rows.
- Decorative imagery becomes quieter or is removed when it competes with forms and dense data.

## Accessibility and product integrity

- Target WCAG 2.2 AA during implementation.
- Keep visible keyboard focus and logical reading order.
- Respect reduced motion.
- Distinguish zero, no data, delayed data, and load error.
- Distinguish save, review, approval, publication, and external delivery.
- Do not invent integration support, legal fields, limits, performance data, or revenue.
- Static designs specify intent; they do not prove runtime behavior.

## Do and do not

Do reuse local variables, component masters, and original brand assets. Do keep one clear next
action and label illustrative data. Do make each music insert specific to its workflow.

Do not cover working content with bright imagery, apply large generic shadows, use glow as the only
selection indicator, repeat one visual everywhere, or treat the dark system as literal values for
light and dim themes.
