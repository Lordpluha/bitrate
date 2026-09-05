---
sidebar_position: 7
---

# Bitrate — Design Principles

> Status: Design direction v1.0  
> This document translates the Bitrate brand foundation into product and visual design rules. It intentionally defines principles before fixed colors, fonts, or a final logo.

## 1. Design objective

Bitrate should make a complex music ecosystem feel calm, obvious, and controllable.

The interface should communicate:

**“You know where you are. You know what happens next.”**

Design is successful when users notice the music and their work more than the interface.

## 2. Design character

The visual system should feel:

- neutral;
- technological;
- professional;
- contemporary;
- quietly energetic;
- human;
- culturally connected to music without using obvious music clichés.

Avoid visual language that feels:

- gamer-like;
- crypto-like;
- aggressively futuristic;
- luxury for the sake of luxury;
- childish;
- like a generic SaaS admin dashboard;
- like a social network chasing attention.

## 3. Core UX principle

### Simple by default. Deep when requested.

The default experience should expose only what is needed to complete the current step.

Advanced controls should be available contextually through an **Advanced settings** disclosure within the relevant step.

Do not put beginners in front of a professional control panel and call it flexibility.

## 4. Guided workflows

Important workflows should be represented as clear sequences.

For a release flow, for example:

**Upload → Release info → Distribution → Review → Scheduled**

A user should always be able to answer:

- Where am I?
- What is complete?
- What is required now?
- What comes next?
- When should I expect the result?

Steppers and timelines are core interaction patterns for Bitrate.

## 5. Progressive disclosure

Advanced options belong next to the stage they affect.

Example:

**Release date**  
September 18, 2026

`Advanced settings ▾`

The disclosure may contain territory rules, store-specific options, identifiers, metadata controls, or other professional settings.

This keeps expert capability without making expert complexity the default experience.

## 6. Information hierarchy

Every screen should have one obvious primary task.

Recommended hierarchy:

1. current objective;
2. current status;
3. required action;
4. relevant supporting information;
5. optional advanced controls;
6. secondary navigation.

If everything looks important, the design has failed.

## 7. Status design

Statuses are a major trust mechanism.

Use precise states such as:

- Draft
- Missing information
- Ready for review
- Submitted
- Processing
- Delivered
- Scheduled
- Live
- Action required

Avoid vague states such as “Working on it” when a more precise state is available.

Whenever possible, pair status with the next meaningful event:

**Scheduled**  
Release date: September 18

## 8. Time and expectations

When Bitrate depends on external systems, communicate that dependency clearly.

Prefer:

**Submitted to distribution provider**  
Expected update within 2–5 days.

Do not imply that Bitrate controls a delivery time it cannot guarantee.

## 9. Copy inside the interface

Product copy follows the brand tone: calm confidence.

Buttons should describe actions:

- Upload track
- Continue
- Review release
- Submit release
- View analytics

Avoid:

- Let's go!
- Make some magic
- Drop it!
- You're crushing it!

Success states do not require confetti to feel successful.

## 10. Streaming experience

The player is an important surface, but it is not the definition of Bitrate.

The player should feel native to the wider ecosystem. From music, users should be able to move naturally toward the artist, releases, relevant commerce, and other music-centered actions without turning listening into a sales funnel.

Listening must remain enjoyable on its own.

## 11. Artist surfaces

An artist presence can gradually become a central hub containing:

- releases;
- tracks;
- artist information;
- posts or updates where relevant;
- products or beats;
- analytics for authorized users;
- promotion tools;
- relevant links;
- lightweight communication;
- future monetization surfaces.

Do not recreate a generic social profile. Every module should have a reason to exist in a music workflow.

## 12. Visual hierarchy over decoration

Prefer spacing, typography, scale, alignment, and motion to excessive decoration.

The interface should not need gradients, glass effects, neon, or constant animation to feel modern.

Music artwork already introduces substantial visual diversity. The product shell should give artwork room rather than compete with it.

## 13. Color direction

The palette is locked: **Bitrate Purple `#7c3aed`** as the primary, with secondary blue and
semantic green/amber/red, across three themes — dark (default), light, and dim. The values live
in `packages/ui-react/src/styles/`; [`tokens.md`](./tokens.md) owns how they are organised and
[`bitrate-brand-board.png`](./bitrate-brand-board.png) is the board they came from. Do not
restate a hex here.

What that palette had to satisfy, and what any future change to it must still satisfy:

- strong readability;
- light and dark environments;
- album artwork of any color;
- long professional sessions;
- clear status communication;
- a recognizable accent without dominating content.

Avoid choosing a signature color solely because another music platform does not use it.

## 14. Typography direction

Brand v1.0 does **not** lock a final typeface yet.

Typography should be:

- highly legible;
- international;
- clean at UI sizes;
- strong enough for cultural/editorial surfaces;
- neutral enough for professional tools.

A single flexible family or a restrained display/UI pairing is preferable to a decorative typography system.

## 15. Iconography

Icons should be simple, consistent, and functional.

Avoid relying on music-note, headphone, waveform, or vinyl icons as generic decoration. Use music symbols only when they communicate an actual function.

## 16. Motion

Motion should explain state or continuity.

Good uses:

- showing progression between release steps;
- expanding advanced settings;
- connecting player transitions;
- indicating upload or processing state;
- clarifying hierarchy changes.

Avoid motion whose only purpose is to make the interface feel “alive.”

## 17. Advertising

Advertising must visually respect the product.

Ads should:

- be clearly identifiable;
- not imitate system controls;
- not unexpectedly interrupt playback;
- not create false urgency;
- not obstruct the user's current task.

The free product should still feel like Bitrate, not like an ad container.

## 18. Premium

Premium surfaces should explain additional value rather than shame free users.

Prefer:

**Advanced audience analytics — available with Bitrate Pro**

over:

**Upgrade to unlock the analytics you need.**

Do not intentionally design friction and then sell its removal.

## 19. Accessibility

Simplicity includes accessibility. The binding contract — contrast ratios, target sizes, reflow,
focus, and reduced motion — is [`a11y.md`](./a11y.md); it is a release constraint, not a polish
pass. This section states only why it belongs to design rather than to a later cleanup.

Design for:

- keyboard navigation;
- screen readers;
- sufficient contrast;
- scalable text;
- visible focus states;
- understandable errors;
- non-color-only status indicators;
- localization and longer translated strings.

Accessibility is a product-quality requirement, not a later visual polish task.

## 20. Responsive behavior

Core workflows should remain understandable across desktop and mobile.

Do not merely compress desktop dashboards into a phone.

On smaller screens, preserve:

1. status;
2. next action;
3. current content;
4. optional detail.

## 21. Component philosophy

Components should encode Bitrate's principles.

Examples:

- `Stepper` — guided progress;
- `Status` — precise system state;
- `Timeline` — expectations and dates;
- `AdvancedDisclosure` — optional depth;
- `ReleaseCard` — release identity + state + next action;
- `ArtistCard` — music identity without social-network clutter;
- `Player` — persistent listening without dominating the application.

Reusable components should reduce both engineering complexity and cognitive inconsistency.

## 22. AI-generated design rule

When an AI system generates or modifies Bitrate UI, it should first ask:

1. What is the user's primary task?
2. What information is actually required now?
3. Can anything be hidden until requested?
4. Is the next step obvious?
5. Does this look like a music platform rather than generic SaaS?
6. Are we adding visual noise merely to make the screen look designed?
7. Does the result preserve calm confidence?

If uncertain, choose the simpler implementation.

## 23. Design decision test

Before accepting a design, ask:

**Does this make the musician's next step clearer without reducing useful control?**

If yes, it is probably moving in the Bitrate direction.

If it adds explanation because the interface itself became harder to understand, reconsider the design.

## 24. Logo

The mark is a single gradient glyph — a stylised **B** built from two stacked strokes, filled left
to right from `#490AE5` to `#C060FA`. It is self-coloured, so it needs no light-theme variant and
no recolouring: place it on any surface the palette defines.

It lives at `packages/ui-react/assets/icons/logo-icon.svg` and reaches the product only through the
generated `LogoIcon` component, exported from `@bitrate/ui-react`. Never import the SVG or a copy of
it directly; the svgr build owns that file and namespaces its gradient id.

`LogoIcon` expands each gradient stop into a prop (`primaryColor`, `secondaryColor`, `color3`…), all
defaulted to the values above. **Passing one of them recolours a single stop, not the mark** — a lone
`primaryColor="#FFF"` produces a white-to-purple ramp rather than a white glyph. Leave them unset.

Every raster icon in both apps — the multi-size favicon, `apple-icon`, and the PNG manifest icons —
is rasterised from this vector against the brand dark ground. Regenerate them from the SVG rather
than editing a PNG, and keep `src/app/icon.svg` in step with the source.

**The wordmark is not settled.** It exists only as pixels inside the social cards
(`apps/web-*/src/app/opengraph-image.png`) and the brand board, so the header, footers, and the
artists lockup render the mark alone and their slots are square. A wordmark vector replaces
`logo.svg` and turns those slots back into lockups; until then, do not trace one from the raster.

## 25. What remains intentionally open

The following should be developed in the visual identity phase rather than invented prematurely:

- final wordmark, and the mark-plus-wordmark lockup;
- final typography;
- exact spacing scale;
- illustration system;
- photography direction;
- motion tokens;
- final icon family.

These decisions must follow the brand pages — [foundation](./foundation.md),
[positioning](./positioning.md), [principles](./principles.md) — not redefine them.
