---
sidebar_position: 10
---

# Motion

> Status: Motion guide v1.0. It applies to the web player, the artist portal and the landing page.
> **Reference prototypes** are standalone HTML files that you open in a browser:
> `pencil/web-player-design/app-motion/app-motion-prototype.html` (app patterns) and
> `pencil/web-player-design/landing/motion-prototype.html` (landing).
> **Static states** are in Pencil: `design-system/bitrate.lib.pen` → page "00E • Page Blocks" and
> "09 • Toasts", and the screens in `player/web-player-main.pen`, `loading/`, `cursor/` and `error/`.

The motion principles are in [Design principles §16](./design.md#16-motion). This page explains
how to build each Bitrate motion pattern in the apps so that it looks and feels like the
prototypes.

## 1. Rules that apply everywhere

1. **Motion explains a state change.** It shows where something came from, what changed, or that
   work is still in progress. Do not add decorative loops on working surfaces. Ambient motion
   (Atmosphere, the landing background) is something the user opts into or confines to marketing.
2. **Only transform and opacity on large surfaces.** Animate `transform` and `opacity`. Animate
   `height`, `clip-path`, `filter` or a CSS variable only on small, isolated elements, and only for
   one-shot transitions. Never animate them continuously.
3. **Measure once, then animate.** Layout-like transitions (palette, video modal) use FLIP: read
   both rectangles, invert with a transform, then play to identity. Never read layout inside a
   frame callback.
4. **Every pattern has a reduced-motion version.** Check `prefers-reduced-motion: reduce`. Durations
   collapse to about 10 ms, and loops, springs and parallax stop. The end state must still be
   visible and complete.
5. **Pause off-screen.** Loops stop when the document is hidden (`visibilitychange`) or the element
   leaves the viewport (`IntersectionObserver`).
6. **Interruptible.** A new interaction kills the running tween for the same target before starting
   the next one. Never queue animations behind each other.
7. **Motion never blocks input or focus.** Focus moves immediately. Animation only follows.

## 2. Duration and easing tokens

Use these names in code. Planned CSS custom properties are listed for
`packages/tailwind/src/animations.css`. Until they are added there, use the values directly.

| Token | Value | Use |
|---|---|---|
| `--motion-instant` | 100–160 ms | content fade-out before a swap, closing tooltips |
| `--motion-fast` | 200–250 ms | hover and press feedback, scrim fade, toast dismiss |
| `--motion-base` | 320–400 ms | panels, lists, toast stack layout, height morphs |
| `--motion-emphasis` | 450–550 ms | palette open, video modal open, tooltip morph |
| `--motion-loader` | 2.4 s write + 1.3 s tail | logo loader cycle |
| `--motion-ambient` | 9 s per revolution | atmosphere rim; the landing particle drift |

| Easing (GSAP name) | CSS equivalent | Use |
|---|---|---|
| `expo.out` | `cubic-bezier(.16, 1, .3, 1)` | things arriving: palette, modal, new toast |
| `power3.out` | `cubic-bezier(.215, .61, .355, 1)` | layout settling: stack, panel height, tab content |
| `power3.in` / `power2.in` | `cubic-bezier(.55, .055, .675, .19)` | things leaving: palette close, old tab content |
| `back.out(1.6)` | `cubic-bezier(.34, 1.56, .64, 1)` | small reveals with character: tab labels |
| `back.out(4)` | spring via `linear()`, or WAAPI keyframes `.8 → 1.08 → 1` | the Like pop |
| `elastic.out(1, .75)` | `linear()` spring curve | tooltip morph, health panel bloom |
| `none` | `linear` | rotations, progress, the cursor follow |

**Exits are shorter than entrances.** Roughly 0.6× the entrance time with an "in" easing, for example
palette 0.5 s in and 0.32 s out.

## 3. Choosing the tool

| Need | Tool |
|---|---|
| Hover, press, focus, simple enter or exit | CSS transitions on transform and opacity (Tailwind `transition-*`, `duration-*`) |
| Enter or exit of mounted elements in React | CSS plus the `data-state` attributes Base UI already exposes (`data-[starting-style]`, `data-[ending-style]`) |
| FLIP, measured height morphs, staggered lists | Web Animations API (`element.animate`) in a small hook, or GSAP if the surface already uses it |
| Timelines with several tracks (logo loader, landing scenes) | GSAP 3 (`gsap`, `@gsap/react` `useGSAP` for cleanup). This is a proposed dependency that no app installs yet, so add it per workspace only when a surface needs a timeline. |
| Scroll-linked effects | CSS scroll or view timelines when supported, otherwise an `IntersectionObserver` trigger. Never scroll-event handlers. |

Shared motion code belongs in `packages/ui-react` (for example `src/motion/`), next to the
component that uses it. The Svelte player engine (`packages/player`) keeps its own CSS
transitions and must not depend on host animation libraries.

## 4. Pattern recipes

Each recipe lists the Pencil component, the timing and how to build it.

### 4.1 Command search: the trigger grows into the palette

Pencil components: `Command/Trigger`, `Command/Palette`, `Command/Group`, `Command/Item`,
`Command/Item Active` and `Command/Item Media`. The screens are "Command palette" and "Command search".

- **Open** (⌘K / Ctrl K, `F`, or click). Mount the palette, measure the trigger and the palette, then
  play from the trigger's rect to identity: `translate`, plus `scale` for each axis, with the radius
  going from 10 to 16. Use 0.5 s `expo.out`. The scrim fades in over 0.25 s. The content fades in
  over 0.2 s after a 0.12 s delay, so the box arrives first.
- **Filter.** Morph the result list height from the old to the new `scrollHeight` over 0.32 s
  `power3.out`, then clear the inline height. Items fade and rise 6 px with a 15 ms stagger.
- **Close** (Esc, scrim, or run a command). Fade the content over 0.1 s, then shrink back into the
  trigger over 0.32 s `power3.in`. Return focus to the trigger.
- **Accessibility.** Use `role="dialog"` with a `combobox` and `listbox`. The active item has
  `aria-selected`. Arrow keys move the selection and Enter runs it. Hover changes the selection
  but not the focus.

### 4.2 Atmosphere mode

Pencil components: `Atmosphere/Frame` (angular-gradient rim, outer halos and inner edge glow),
`Button/Atmosphere` and `Button/Atmosphere Active`. The screens are "Atmosphere mode", desktop and mobile.

- **Structure.** A fixed, `pointer-events: none` layer above the app has two masked rings: a crisp
  rim `--bw` and a blurred halo of about 34 px. Both show one oversized `conic-gradient` in the
  track colours (from the artwork palette, falling back to primary → magenta → amber → blue).
  The mask is `linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)` with `mask-composite: exclude`.
- **Motion.** Only the gradient element rotates, 360° every 9 s, linear, using `transform` on a
  promoted layer. Turning it on fades the layer in over 0.9 s `power2.out` and plays a two-note
  chime (E5 then B5, gain 0.08, which the user can mute). Turning it off fades out over 0.5 s, then pauses
  the rotation.
- **Intensity.** Soft, Medium and Bold change the halo blur (16/26/42 px), its opacity
  (.7/.85/1) and the rim width (4/5/7 px). These are set once, never animated.
- **Budget.** Pause on `visibilitychange`. Never animate the blur. With reduced motion the ring is
  still: it keeps its colours and does not rotate.

### 4.3 Mobile player: expandable tabs and a direction-aware panel

Pencil components: `Tabs/Expandable` and `Tabs/Expandable Active`. The screen is "Now playing / Mobile".

- **Tabs.** The active tab reveals its label: `max-width` 0 → 90 px, opacity, and an 8 px margin, over
  0.35 s `back.out(1.6)`. The inactive tab collapses with `power2.out`. This is a small isolated
  element, so animating its width is acceptable.
- **Panel switch.** The old content leaves 40 px towards the side opposite the new tab
  (0.16 s `power2.in`). The panel height morphs over 0.4 s `power3.out`. The new content enters from
  40 px on the tab's side over 0.32 s `power3.out`.

### 4.4 Player actions: tooltip morph and the Like pop

Pencil components: `Action/Icon`, `Action/Icon Badge` and `Tooltip`. The screen is "Player action tooltip".

- **Tooltip.** On long-press (touch) or hover, the tooltip opens from its centre with a
  `clip-path: inset(50% … round 8px) → inset(0 … round 8px)` and rises 6 px, over 0.45 s
  `elastic.out(1, .75)`. When it is already open, it slides to the next action over 0.3 s
  `power3.out` instead of reopening. It hides over 0.18 s.
- **Like.** `scale .8 → 1` over 0.5 s `back.out(4)`. Toggle `aria-pressed`.

### 4.5 Toasts

Pencil: library page "09 • Toasts" (`Toast/*`).

- **Region.** Bottom-right above the player bar on desktop, top on phones. Toasts are
  `role="status"`, or `role="alert"` for errors. The region is `aria-live="polite"`.
- **Stack.** The newest toast is in front. Older toasts sit `-12 px × i` higher and are scaled `1 − .05 × i`.
  Only three are visible. Hovering the region expands the stack into a list with 10 px gaps. Each
  layout change is 0.35 s `power3.out`.
- **Enter.** From `y: 40, opacity: 0` over 0.4 s `expo.out`. **Dismiss**: opacity → 0 and 10 px
  down over 0.25 s. **Swipe**: a drag past 80 px dismisses it. Otherwise it springs back over 0.2 s.
- **Lifetime.** Success and info close after 4 s. Hovering pauses the timer. Errors stay until the
  user closes them. Loading toasts use the mini logo loader and turn into a success toast when done.

### 4.6 Logo loader

Pencil: `Loader/Logo Write`, `Loader/Logo Erase` and the "loading" designs. The reference module
is `window.BitrateLogoLoader` in both prototypes.

- **Modes.**
  - `draw` / `loop`: the full-screen gesture.
  - `once`: the app splash, which fades out over 0.5 s once it finishes.
  - `progress`: determinate, mapping 0–1 to the write.
  - `mini`: a comet that runs the outline inside buttons, table rows and toasts.
- **Gesture.**
  1. A ribbon in the brand gradient, as thick as the mark's strokes (118 units), flies in from
     beyond the top-left edge of its container.
  2. It writes stroke A, the flourish, then stroke B. The mark is revealed exactly where it passes:
     a mask stroke with `stroke-dashoffset`.
  3. It leaves beyond the bottom-left edge, 2.4 s `power1.inOut`, and its tail pulls out after it
     (1.3 s `power2.in`).
  4. The white outline (a 12% dash) runs only after the mark is fully painted, at 2.45 s for 0.9 s.
- **Build.** Use one inline SVG with `#bitrate-logo` from `packages/ui-react/assets/icons/logo-icon.svg`.
  Animate only `stroke-dashoffset` and opacity. Recompute the viewBox and the ribbon paths on
  `ResizeObserver`.
- **Reduced motion.** The mark fades in over 0.6 s. The mini loader runs slowly (3 s per lap).

### 4.7 404: the track that will not play

Pencil: the `error` designs (`NotFound`). The spectrum bars breathe (`scaleY` .4–1.3, 0.45 s
`sine.inOut`, 40 ms stagger, yoyo). The middle bars stay flat. The "404" numerals glitch every 2.6 s:
`x -4 → 0`, `skewX 8 → 0` and a hue rotation, over 0.35 s `steps(4)`. With reduced motion there are
no loops and the flatline stays as a still image.

### 4.8 Videos: cursor-following play pill and modal

- **Pill.** On a fine pointer, a "Play" pill follows the cursor inside the thumbnail
  (`quickTo` x/y, 0.35 s `power3`). It recentres over 0.5 s on leave. On touch it stays centred.
- **Modal.** FLIP from the thumbnail rect to the player box over 0.55 s `expo.out`, with a 0.25 s
  scrim fade. Close fades it over 0.2 s and leaves fullscreen first. The control bar auto-hides
  while playing.

### 4.9 Signal cursor

Pencil: the `cursor` designs. This is for fine pointers only (`(hover: hover) and (pointer: fine)`).
Touch keeps the system cursor and gets a press ripple.

- A 6 px dot follows the pointer 1:1. A 40 px ring trails it on a spring. Width and height transitions
  use 0.32 s `cubic-bezier(.2, .8, .2, 1)`.
- Modes come from `data-cursor` or the target type:
  - **link**: the ring opens around the target.
  - **play**: a pill with a label (`data-cursor-label`).
  - **text**: a beam.
  - **seek**: a vertical line.
  - **level**: bars that follow the playing level.
- With reduced motion the trailing spring is removed and the ring follows exactly.

### 4.10 Service health (landing footer)

The pill blooms into a status panel through an SVG goo filter
(`feGaussianBlur 9` and `feColorMatrix 22 -10`):

- The blob behind the panel is sized from the panel's measured height, so content never
  spills out. It scales from `.12 × .05` to 1 over 0.75 s `elastic.out(1, .72)`.
- Rows slide in 12 px with a 35 ms stagger, and the uptime bars grow from the end.
- The panel caps at the viewport height and scrolls inside.
- Hover opens it with a mouse. A click right after a hover-open keeps it open. Tap toggles it on
  touch.

### 4.11 Island navigation (mobile)

Pencil components: `Mobile/Island`, `Mobile/Island Compact`, `Mobile/Island Live` and
`Mobile/Island Actions`. The screens are in `mobile-island/mobile-island.pen`, and the prototype is
`mobile-island/island-prototype.html`.

- **Shape.** One floating glass capsule, 18 px above the safe area, 66 px tall. It holds the
  artwork with a progress ring, four tabs (Home, Search, Library, Jam) and play. The active tab's
  pill slides between tabs over 0.45 s with `cubic-bezier(.34, 1.4, .64, 1)`.
- **Compact.** Scrolling down past 80 px shrinks the island to 212 px: artwork, track and a level
  meter. Scrolling up, or tapping it, restores it. The width uses a 0.5 s spring; the content
  crossfades over 0.25 s. Scroll only toggles the state; it never drives the animation.
- **Live activity.** Jam joins, Bitrate Connect handoffs and new releases widen the island to 78 px
  for about 4 s with one action, then it returns to its previous state.
- **Gestures.** A tap or a swipe up opens the player. Swiping sideways more than 46 px skips a track:
  the artwork slides out over 0.16 s and in over 0.38 s. Holding for 480 ms opens quick actions
  (Like, Queue, Connect, Sleep), which rise over 0.42 s `back.out(2)` with a 40 ms stagger.
- **Bloom into the player.** The player's `clip-path` grows from the island's own rect to the screen
  over 0.62 s `expo.out`, and its content rises 26 px with a 45 ms stagger. Closing it (drag down
  past 110 px, ⌄ or Esc) shrinks it back over 0.42 s `power3.in`, and the island pops in again.
- **Naming.** Listening together is always **Jam**. Moving playback between devices is always
  **Bitrate Connect**. Devices are named by the device, never by a room.

## 5. Atmosphere, cursor and loaders in Pencil

Pencil shows the **resting states** of each pattern, and the prototypes show the motion. When a
pattern changes, update both in the same change (see the prototype ⇄ Pencil rule in the design
workflow). In particular:

- New states go into the library as `ds:` components first, then into screens.
- Copy, labels and state names match between the HTML prototype and the `.pen` screens.
- Every motion pattern has its loading, empty and error resting state drawn.

## 6. Review checklist

- [ ] It explains a state change, or it is opt-in ambient motion.
- [ ] Only transform and opacity on large surfaces. Blur is never animated.
- [ ] The values match the tokens above. Exits are shorter than entrances.
- [ ] The reduced-motion path was tested (DevTools → Rendering → Emulate CSS prefers-reduced-motion).
- [ ] Loops pause when hidden or off-screen. There is no rAF loop without a stop condition.
- [ ] Focus and keyboard work without waiting for the animation.
- [ ] Works without WebGL (the landing has 2D and DOM fallbacks) and on a 390 px phone.
