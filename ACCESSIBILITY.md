# Accessibility

Bitrate targets **WCAG 2.2 Level AA** for every user-facing surface. An accessibility
regression is treated like a failing test: it blocks the merge.

This file is the human-facing entry point. It states the commitment, the requirements that
are specific to a music product, where each workspace stands today, the known gaps, and how
they get closed. The general rules (contrast, keyboard, ARIA, forms, motion, reflow) are not
repeated here. They live in one place:

| Source | Owns |
|---|---|
| [`apps/docs/docs/brand/a11y.md`](apps/docs/docs/brand/a11y.md) | The baseline contract: contrast, keyboard and focus, semantics, forms, motion, targets, reflow |
| [`apps/docs/docs/brand/motion.md`](apps/docs/docs/brand/motion.md) | Reduced-motion version of every motion pattern |
| [`apps/docs/docs/brand/tokens.md`](apps/docs/docs/brand/tokens.md) | Colour roles and themes; token pairs are where contrast is decided |
| [`.claude/references/architecture-checklist.md`](.claude/references/architecture-checklist.md) | The review checklist (React-5, Style-3, form ARIA) |
| [`.claude/references/react-guide.md`](.claude/references/react-guide.md) | React implementation baseline |
| [`.claude/references/forms-guide.md`](.claude/references/forms-guide.md) | Form labelling and error association |
| [`.claude/rules/mobile-rules.md`](.claude/rules/mobile-rules.md) | React Native accessibility props, 44 × 44 pt targets |

When this file and one of those sources disagree, the source wins and this file is fixed.

---

## Scope

| Surface | Workspace | Commitment |
|---|---|---|
| Web player | `apps/web-player` | WCAG 2.2 AA |
| Artist workspace | `apps/web-artists` | WCAG 2.2 AA |
| Admin | `apps/admin` | WCAG 2.2 AA (internal users are users too) |
| Player element | `packages/player` | WCAG 2.2 AA for everything inside the shadow root |
| Design system | `packages/ui-react` | Every component is AA by default; consumers should not need to patch it |
| Mobile | `apps/mobile` | Platform guidance (iOS/Android) plus the mobile rules, from the first real screen |
| Desktop | `apps/desktop` | Inherits the web commitment for its renderer, from the first real screen |

`apps/mobile` and `apps/desktop` are still starters. The commitment applies when product
screens start landing there, not retroactively to the scaffold.

## Support matrix

Changes to a flow are checked with at least one row from each group before the flow is
called done.

| Group | Configuration |
|---|---|
| Screen reader, desktop | NVDA + Firefox or Chrome (Windows); VoiceOver + Safari (macOS) |
| Screen reader, mobile web | VoiceOver + Safari (iOS); TalkBack + Chrome (Android) |
| Keyboard only | Chrome or Firefox, no pointer |
| Visual | 200% and 400% browser zoom at 1280 px; 320 px viewport; every theme (dark, light, dim) |
| Preferences | `prefers-reduced-motion: reduce`; Windows High Contrast (`forced-colors: active`) |

---

## Requirements specific to Bitrate

These come on top of the baseline. They exist because Bitrate plays audio, ships three
themes and five front-ends.

### Playback

- **P-1 Every playback action works from the keyboard and has an accessible name:** play,
  pause, previous, next, seek, volume, mute, shuffle, repeat, like, queue. Toggles expose
  their state (`aria-pressed`, or a name that changes with the state).
- **P-2 Seek and volume speak human values.** A slider announces `1:23 of 3:45`, not `83`,
  and the volume announces a percentage (`aria-valuetext`). Time readouts that sit next to the
  slider are not a substitute, because a screen reader on the slider never reaches them.
- **P-3 Track changes are announced once.** A polite live region announces the new title
  and artist. Progress ticks, buffering and position updates are never announced.
- **P-4 Single-key shortcuts are controllable (SC 2.1.4).** Any shortcut that uses a letter,
  digit or punctuation key without a modifier can be turned off in settings, or works only
  while the player has focus. Shortcuts are listed in a keyboard-shortcut help dialog.
- **P-5 Global shortcuts do not take keys from the page.** Arrow keys and Space go to the
  player only when focus is on the player or nowhere interactive *and* the page cannot use
  them, such as scrolling. Editable fields, sliders, listboxes, menus and dialogs always
  keep their keys.
- **P-6 No surprise audio (SC 1.4.2).** Nothing starts playing on page load without a user
  gesture. The user's `autoplay` setting only continues a queue the user started. Any audio
  that plays can be paused or muted from a control reachable in the first few Tab stops.
- **P-7 Media Session is wired** wherever playback can run in the background, so OS media
  keys, lock screens and headset buttons work. That route is assistive too.

### Themes and colour

- **T-1 Contrast is met in every theme:** dark, light and dim. A token pair that passes in
  dark and fails in dim is a failure. `a11y.md` names only dark and light; dim is held to the
  same bar.
- **T-2 Forced colours stay usable.** In `forced-colors: active`, focus rings, selected
  states, slider tracks and the playing indicator stay visible. Use `outline` (which the
  system recolours) or `CanvasText`/`Highlight` system colours, not background-only cues.
- **T-3 Focus is never background-only.** `outline-none` is allowed only when the same
  element, or a wrapper through `has-[:focus-visible]`, draws a ring with `--color-ring` that
  has at least 3:1 contrast.

### Language and content

- **L-1 `<html lang>` matches the content from the first byte** in every locale (en, pl, uk),
  not only after hydration. A screen reader that loads the server HTML must pick the right
  voice.
- **L-2 Every accessible name is translated.** No hard-coded English in `aria-label`,
  `aria-valuetext`, live-region text or `alt`. That includes `ui-react` defaults such as the
  spinner's "Loading" and `packages/player` labels.
- **L-3 Audio-only content.** Bitrate has no captions, transcripts or lyrics today, so
  deaf and hard-of-hearing users cannot get the content of the audio. Music itself is
  exempt from captions, but any spoken-word or video content Bitrate adds (artist
  messages, promo video, podcasts) ships with captions or a transcript from day one. When
  lyrics land (roadmap v0.9.0) they are synchronised text that a screen reader can read,
  not an image.

### Navigation

- **N-1 Skip link** to the main content is the first Tab stop on every app shell.
- **N-2 One `<main>` per page,** with `<nav>`, `<header>`, `<aside>` landmarks named when there
  is more than one of a kind (for example the sidebar and the player bar).
- **N-3 Route changes move focus or announce the new page title.** Client-side navigation
  must not leave focus on a link that has disappeared.
- **N-4 The persistent player bar is a labelled region** (`aria-label="Player"`), reachable
  through landmark navigation, and it does not cover focused content (SC 2.4.11).

### Design system

- **D-1 `ui-react` components ship accessible.** Base UI primitives keep their ARIA; any
  custom component documents its keyboard model in its story.
- **D-2 No unexplained suppressions.** Every `biome-ignore lint/a11y/*` and
  `eslint-disable … template/*` carries a real reason. A placeholder reason is a lint
  failure in review.
- **D-3 Storybook a11y is a gate, not a report.** Shared components fail their build when
  axe reports a violation.

---

## Current state

Audited on 2026-11-19 against `develop` at `8c657ce74`.

### Tooling

| Check | Where it runs | Gate? |
|---|---|---|
| Biome `recommended` a11y group | root, `ui-react`, `web-player`, `web-artists`, `desktop` | Yes, through `biome ci` |
| angular-eslint `templateAccessibility` | `apps/admin` | Yes, through lint in CI |
| `eslint-plugin-svelte` recommended + Svelte compiler a11y warnings | `packages/player` | Lint only |
| `@storybook/addon-a11y` | `ui-react`, `player` | **No**: `a11y: { test: 'todo' }` only reports |
| axe in Playwright / Vitest | nowhere | — |
| Contrast check on token pairs | nowhere (`check:tokens` only rejects stock scales and hex) | — |
| Mobile a11y lint | none (`eslint-config-expo` only) | — |

### What already works

- **web-player:**
  - Global `:focus-visible` ring from `--color-ring`.
  - Global reduced-motion override.
  - `TrackAnnouncer` polite now-playing region, with a spec.
  - `useOverlayFocus` (trap, Escape, restore) for its dialogs.
  - `inert` behind the burger menu.
  - Player hotkeys that skip editable targets.
  - Labelled volume range.
  - Media Session.
- **web-artists:**
  - `<html lang={locale}>`.
  - Skip link to `#workspace-content`.
  - Native `<dialog>` with initial focus and restore.
  - Sliders with `aria-valuetext` (listening chart, waveform).
  - Reduced motion handled throughout.
  - Live regions on charts.
- **admin:**
  - Template a11y lint.
  - `aria-invalid` / `aria-describedby` on forms.
  - `sr-only` text throughout.
  - Reduced-motion styles.
- **player element:**
  - Native buttons and ranges with labels.
  - `aria-pressed` toggles.
  - `role="alert"` errors.
  - Decorative cover `alt=""`.
  - Reduced-motion styles.
  - Translatable labels.
  - Opt-in Media Session.
- **ui-react:**
  - Base UI for menus, popovers, selects and tooltips.
  - Form fields wire `aria-describedby` / `aria-invalid`.
  - Password toggle exposes `aria-pressed`.

## Known gaps

Ordered by severity within each workspace. IDs are stable; reference them in commits and
PRs.

| ID | Workspace | Gap | Evidence | Requirement |
|---|---|---|---|---|
| A11Y-01 | web-player | Single-key shortcuts (M, S, R, L, Q, +, −) are global and cannot be turned off | `widgets/Player/model/usePlayerHotkeys.ts:132-173`; `isEnabled` follows only player visibility (`usePlayerController.ts:69`) | P-4 |
| A11Y-02 | web-player | Arrow keys and Space are taken from the page whenever focus is outside an interactive element, so arrow-key scrolling stops working | `usePlayerHotkeys.ts:97-128` | P-5 |
| A11Y-03 | web-player | Server HTML is always `lang="en"`; the real locale is set only after hydration | `app/layout.tsx:74-79`, `shared/i18n/ui/I18nProvider.tsx:19` | L-1 |
| A11Y-04 | web-player | No skip link | no match in `src/` | N-1 |
| A11Y-05 | web-player | Library mobile search input removes the outline with no replacement | `views/Library/ui/LibraryMobileControls.tsx:73` | T-3 |
| A11Y-06 | web-player | Route-change focus or announcement is not implemented by the app; it relies on whatever Next.js provides, which is unverified | — | N-3 |
| A11Y-07 | player | Seek and volume ranges have no `aria-valuetext`; seek announces raw seconds | `RangeInput.svelte:25-35`, `SeekBar.svelte` | P-2 |
| A11Y-08 | ui-react | Eight `biome-ignore lint/a11y/*` with the placeholder reason `hz`, including a `div onClick` without keyboard support in `InputGroup` | `carousel.tsx:146,182`, `item.tsx:10`, `input-group.tsx:10,62-63`, `button-group.tsx:30` | D-2 |
| A11Y-09 | ui-react | Menu and select items use `outline-none` with a background-only focus state | `dropdown-menu.tsx:43,99,116,139`, `select.tsx:120` | T-2, T-3 |
| A11Y-10 | ui-react | `Badge` uses `focus:` instead of `focus-visible:` | `badge.tsx:6` | baseline |
| A11Y-11 | ui-react | `Spinner` label is hard-coded English | `spinner.tsx:8-9` | L-2 |
| A11Y-12 | ui-react, player | Storybook a11y does not fail the build | `.storybook/preview.tsx:54`, `.storybook/preview.ts:17` | D-3 |
| A11Y-13 | admin | `<html lang="en">` is static; switching to uk does not update it | `src/index.html:2` | L-1 |
| A11Y-14 | admin | No skip link | — | N-1 |
| A11Y-15 | web-artists | `<html className="dark">` is hard-coded in the root route; confirm the theme script replaces it before paint, or light-theme users get a flash of the wrong contrast | `routes/__root.tsx:79-82` | T-1 |
| A11Y-16 | all web | No `forced-colors` handling anywhere | — | T-2 |
| A11Y-17 | all web | No automated contrast check for token pairs in any theme | `scripts/check-design-tokens.mjs` | T-1 |
| A11Y-18 | all web | No axe run in e2e or browser tests | — | Verification |
| A11Y-19 | docs | `a11y.md` and `PRODUCT.md` require contrast in dark and light only; dim is not named | `a11y.md` (Colour and contrast) | T-1 |
| A11Y-20 | mobile | Starter screens have no `accessibilityLabel`/`Role` and no reduced-motion handling; no a11y lint | `apps/mobile` | Scope (applies once product screens land) |
| A11Y-21 | desktop | Starter input has a placeholder but no label | `apps/desktop/src/App.tsx:39-43` | Scope (applies once product screens land) |

## Plan

Each phase is a separate PR chain, one workspace per PR, as in
[`commit-style`](.claude/rules/commit-style.md). Phase 1 comes first, because without gates
the fixes in Phase 2 regress silently.

1. **Gates.**
   - Switch Storybook a11y to `test: 'error'` in `ui-react` and `player` (A11Y-12) and fix
     what it surfaces.
   - Add `@axe-core/playwright` to the existing web-player and web-artists e2e suites, with
     one axe pass per route in every theme (A11Y-18).
   - Extend `pnpm check:tokens` with a WCAG contrast check over the declared foreground and
     background token pairs for dark, light and dim (A11Y-17).
2. **Level A failures and blockers.**
   - A11Y-01, A11Y-02: a settings toggle for single-key shortcuts, on by default, persisted
     with account settings; arrows only when nothing scrollable has focus; a shortcut help
     dialog.
   - A11Y-07: `aria-valuetext` in the player element, with translatable templates.
   - A11Y-03, A11Y-13: correct `lang` from the server or at bootstrap.
   - A11Y-08: replace each suppression with a semantic element or a real reason.
3. **AA polish.**
   - Skip links (A11Y-04, A11Y-14).
   - Focus rings (A11Y-05, A11Y-09, A11Y-10).
   - Spinner i18n (A11Y-11).
   - Route-change announcement (A11Y-06).
   - Theme flash check (A11Y-15).
   - Align `a11y.md` with three themes (A11Y-19).
4. **Forced colours** across `packages/tailwind` themes and `ui-react` (A11Y-16).
5. **Native surfaces.**
   - Add `eslint-plugin-react-native-a11y` or an equivalent to mobile.
   - Apply the mobile rules from the first product screen (A11Y-20, A11Y-21).

A gap is closed when its fix is merged together with a test or a gate that would have caught
it. Remove the row from the table in the same PR.

---

## Checking a change

Before marking a UI change ready:

1. `pnpm lint` passes with no new a11y suppression, or every new one carries a real reason.
2. Storybook a11y panel is clean for every touched `ui-react` or `player` story.
3. Tab through the changed flow: everything reachable, order matches the screen, focus
   always visible, Escape closes overlays and focus returns to the trigger.
4. Run it with one screen reader from the support matrix: names, roles, states and
   announcements make sense without the screen.
5. Switch through dark, light and dim; zoom to 200%; narrow to 320 px; turn on reduced
   motion.
6. Testing Library queries use roles and labels (`getByRole`, `getByLabelText`). A test that
   can only find an element by `data-testid` is a hint that the element has no accessible
   name.

The review side of this list is `architecture-checklist.md`.

## Reporting an accessibility problem

Open a GitHub issue titled `[A11Y] <surface>: <what fails>` with:

- the page or component, and the theme and locale;
- the assistive technology, browser and OS (for example NVDA 2026.1 + Firefox);
- what you did, what you expected, what happened;
- the WCAG success criterion, if you know it.

Accessibility issues are bugs, not feature requests, and are triaged the same way as other
bugs of the same user impact. A failure that stops a user from completing a core flow
(signing in, playing a track, publishing a release) is handled as high severity.
