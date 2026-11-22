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
  while the player has focus. Every shortcut is listed where the switch is (web-player:
  Settings → Keyboard).
- **P-5 Global shortcuts do not take keys from the page.** Up and Down go to the player only
  when nothing interactive has focus *and* the focused area cannot scroll that way. Space
  toggles playback when nothing interactive has focus, as music players conventionally do;
  Page Down still scrolls. Editable fields, sliders, listboxes, menus and dialogs always keep
  their keys.
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

- **L-1 `<html lang>` matches the content at every moment** in every locale (en, pl, uk).
  When the server renders English and the client switches language after hydration, `lang`
  switches with the content, not before or after it.
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

Audited on 2026-11-19 against `develop` at `8c657ce74`; the first round of fixes and gates
landed in [#553](https://github.com/Lordpluha/bitrate/pull/553).

### Gates

| Check | Command | Runs in CI |
|---|---|---|
| Biome `recommended` a11y group | `biome ci` | Every Biome workspace |
| angular-eslint `templateAccessibility` | `pnpm --filter @bitrate/admin lint` | admin |
| Token contrast, every theme | `pnpm check:tokens` | ui-react "Design Tokens" job |
| axe over every ui-react story, every theme | `pnpm --filter @bitrate/ui-react test:a11y` | ui-react "Accessibility" job |
| axe over every player layout | `pnpm --filter @bitrate/player test:browser` | player browser tests |
| axe over web-player routes, every theme | `pnpm --filter @bitrate/web-player test:screenshot` | web-player screenshot job |
| axe over web-artists public routes | `pnpm --filter @bitrate/web-artists test:screenshot` | web-artists screenshot job |

A story or route that must skip an axe rule says why in its `parameters.a11y` (Storybook's own
format), and the exemption names a gap below.

### What works

- **Everywhere on the web:**
  - Contrast holds in dark, light and dim. `text-brand` is the purple for text,
    `destructive-surface` the red for filled controls.
  - Focus stays visible in forced colours: `outline-hidden`, not `outline-none`, plus a
    forced-colours layer in `@bitrate/tailwind`.
  - A skip link in every app shell.
- **web-player:**
  - Single-key shortcuts can be switched off and are listed in Settings → Keyboard.
  - Up/Down leave scrollable pages alone.
  - Every page has a title, which the Next.js route announcer reads on navigation.
  - Accessible names contain the visible label (WCAG 2.5.3).
  - Slider values are spoken, and the live region announces the track.
- **web-artists:**
  - `<html lang>` follows the locale from the server.
  - Native `<dialog>` with initial focus and restore.
  - Sliders speak their values.
- **admin:**
  - `<html lang>` follows the locale switch.
  - Template a11y lint.
  - Forms wire `aria-invalid` and `aria-describedby`.
- **player element:**
  - Seek and volume speak `1:23 of 3:45` and `75%`, translatable through `labels`.
  - Pressed buttons and sliders keep a visible shape in forced colours.
- **ui-react:**
  - Every story passes axe in every theme.
  - Items in an `ItemGroup` are list items.
  - Decorative separators carry no stray ARIA.
  - No placeholder lint suppressions.

## Known gaps

IDs are stable; reference them in commits and PRs. Closed rows are removed in the PR that
closes them (A11Y-01 to A11Y-19 closed in #553; A11Y-03 and A11Y-15 turned out not to be
defects: the server HTML is English content with `lang="en"`, and the web-artists theme
script runs before paint).

| ID | Workspace | Gap | Evidence | Requirement |
|---|---|---|---|---|
| A11Y-20 | mobile | Starter screens have no `accessibilityLabel`/`Role` and no reduced-motion handling; no a11y lint | `apps/mobile` | Scope (applies once product screens land) |
| A11Y-21 | desktop | Starter input has a placeholder but no label | `apps/desktop/src/App.tsx` | Scope (applies once product screens land) |
| A11Y-22 | ui-react | `Table`'s scroll wrapper cannot be reached by keyboard when its content overflows | `components/ui/table/table.tsx`; exempted in the token-catalogue stories | 2.1.1 |
| A11Y-23 | player | Shuffle and repeat show "on" by colour alone outside forced colours (`aria-pressed` covers screen readers) | `element/parts/IconButton.svelte` (`.icon-button--active`) | 1.4.1; needs a design decision |
| A11Y-24 | web-artists, admin | No axe pass over the signed-in workspace or the admin console: the screenshot suites have no fixture API for them | `apps/web-artists/tests/configs`, `apps/admin` | Verification |
| A11Y-25 | web-player | Page titles come from server metadata and stay English in pl and uk | `src/app/**/page.tsx` | 3.1.2 |
| A11Y-26 | web-player | The landing shows the app scaled down (player-preview hotspots 15px tall with no other screen switcher, demo panels), so its targets fall below 24px; `target-size` is skipped on `/` in the route axe pass | `views/LandingView/ui/scenes/PlayerPreview.tsx` (`.pv-spot`), `SceneDevices.tsx`, `SceneRules.tsx` | 2.5.8; needs a design decision |

## Plan

1. **A11Y-24:** extend the fixture APIs so the web-artists workspace and the admin console get
   the same route-level axe pass.
2. **A11Y-22, A11Y-23, A11Y-26:** a focusable, labelled scroll region for `Table`; a
   non-colour "on" mark for player toggles and a visible screen switcher for the landing
   preview, designed in Pencil first.
3. **A11Y-25:** localised titles once the locale reaches the server (cookie or path).
4. **A11Y-20, A11Y-21 (native surfaces):** add `eslint-plugin-react-native-a11y` or an
   equivalent to mobile, and apply the mobile rules from the first product screen.

A gap is closed when its fix is merged together with a test or a gate that would have caught
it. Remove the row from the table in the same PR.

---

## Checking a change

Before marking a UI change ready:

1. `pnpm lint` passes with no new a11y suppression, or every new one carries a real reason.
2. `pnpm --filter @bitrate/ui-react test:a11y` passes, and the Storybook a11y panel is clean for
   every touched `player` story.
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
