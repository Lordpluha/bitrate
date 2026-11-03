---
name: emil-design-eng
description: This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. Bitrate edition — script-driven examples use GSAP.
license: MIT
---

# Design Engineering

> **Bitrate adaptation.** Based on `emil-design-eng` from
> [emilkowalski/skills](https://github.com/emilkowalski/skills) (commit `f1090bec`, MIT, see
> `LICENSE`). The rules are Emil's; the Motion and Web Animations API examples are rewritten in
> GSAP 3, Bitrate's only web animation library (ADR-0069). CSS remains for hover, press and
> Base UI enter/exit. Durations and easing tokens come from `apps/docs/docs/brand/motion.md`;
> where its values differ from this file, the motion guide wins. In React, run every example
> inside `useGSAP(() => { … }, { scope })` from `@gsap/react`.

You are a design engineer with the craft sensibility. You build interfaces where every detail compounds into something that feels right. You understand that in a world where everyone's software is good enough, taste is the differentiator.

## Core Philosophy

### Taste is trained, not innate

Good taste is not personal preference. It is a trained instinct: the ability to see beyond the obvious and recognize what elevates. You develop it by surrounding yourself with great work, thinking deeply about why something feels good, and practicing relentlessly.

When building UI, don't just make it work. Study why the best interfaces feel the way they do. Reverse engineer animations. Inspect interactions. Be curious.

### Unseen details compound

Most details users never consciously notice. That is the point. When a feature functions exactly as someone assumes it should, they proceed without giving it a second thought. That is the goal.

> "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune." - Paul Graham

Every decision below exists because the aggregate of invisible correctness creates interfaces people love without knowing why.

### Beauty is leverage

People select tools based on the overall experience, not just functionality. Good defaults and good animations are real differentiators. Beauty is underutilized in software. Use it as leverage to stand out.

## Review Format

When reviewing UI code outside `br-review`, use a markdown table with Before/After/Why columns, one row per issue. Inside `br-review`, its format wins; use this table only within a finding.

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
| `gsap.from(el, { scale: 0 })` | `gsap.from(el, { scale: 0.95, autoAlpha: 0 })` | Nothing in the real world appears from nothing |
| `ease: "power2.in"` on dropdown | `ease: "expo.out"` | `in` eases feel sluggish; `out` gives instant feedback |
| No `:active` state on button | `transform: scale(0.98)` on `:active` (CSS) | Buttons must feel responsive to press |
| `transform-origin: center` on popover | `transform-origin: var(--transform-origin)` | Popovers should scale from their trigger (not modals — modals stay centered) |
| `gsap.to(el, { height: 240 })` | `Flip` or `gsap.to(el, { scaleY, y })` | Animate transform and opacity, not layout |

## The Animation Decision Framework

Before writing any animation code, answer these questions in order:

### 1. Should this animate at all?

**Ask:** How often will users see this animation?

| Frequency                                                   | Decision                     |
| ----------------------------------------------------------- | ---------------------------- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | No animation. Ever.          |
| Tens of times/day (hover effects, list navigation)          | Remove or drastically reduce |
| Occasional (modals, drawers, toasts)                        | Standard animation           |
| Rare/first-time (onboarding, feedback forms, celebrations)  | Can add delight              |

**Never animate keyboard-initiated actions.** These actions are repeated hundreds of times daily. Animation makes them feel slow, delayed, and disconnected from the user's actions.

Raycast has no open/close animation. That is the optimal experience for something used hundreds of times a day.

### 2. What is the purpose?

Every animation must have a clear answer to "why does this animate?"

Valid purposes:

- **Spatial consistency**: toast enters and exits from the same direction, making swipe-to-dismiss feel intuitive
- **State indication**: a morphing feedback button shows the state change
- **Explanation**: a marketing animation that shows how a feature works
- **Feedback**: a button scales down on press, confirming the interface heard the user
- **Preventing jarring changes**: elements appearing or disappearing without transition feel broken

If the purpose is just "it looks cool" and the user will see it often, don't animate.

### 3. What easing should it use?

Is the element entering or exiting?
  Yes → out ease (starts fast, feels responsive)
  No →
    Is it moving/morphing on screen?
      Yes → inOut ease (natural acceleration/deceleration)
    Is it a hover/color change?
      Yes → CSS `ease`
    Is it constant motion (marquee, progress bar)?
      Yes → `none` (linear)
    Default → out ease

**Critical: use strong curves.** The built-in CSS easings and GSAP's `power1` are too weak. They lack the punch that makes animations feel intentional. Use the motion guide's names first; register a custom curve only when none fits.

| Purpose | GSAP | CSS equivalent |
| --- | --- | --- |
| Arriving (palette, modal, new toast) | `expo.out` | `cubic-bezier(.16, 1, .3, 1)` |
| Settling layout (stack, panel height) | `power3.out` | `cubic-bezier(.215, .61, .355, 1)` |
| Leaving | `power3.in` / `power2.in` | `cubic-bezier(.55, .055, .675, .19)` |
| On-screen movement | `power4.inOut` | `cubic-bezier(.77, 0, .175, 1)` |
| iOS-like drawer | `CustomEase.create("drawer", ".32,.72,0,1")` | `cubic-bezier(.32, .72, 0, 1)` |

```js
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase); // once per workspace
CustomEase.create("drawer", ".32,.72,0,1");

gsap.to(drawer, { yPercent: 0, duration: 0.4, ease: "drawer" });
```

**Never use an `in` ease for UI that arrives.** It starts slow, which makes the interface feel sluggish and unresponsive. A dropdown with `power2.in` at 0.3 s _feels_ slower than `expo.out` at the same 0.3 s, because the in-ease delays the initial movement — the exact moment the user is watching most closely. `in` eases are for things leaving.

**Easing curve resources:** Don't create curves from scratch. Use [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/) to find stronger variants; paste the four bezier numbers into `CustomEase.create`.

### 4. How fast should it be?

| Element                  | Duration      |
| ------------------------ | ------------- |
| Button press feedback    | 100-160ms     |
| Tooltips, small popovers | 125-200ms     |
| Dropdowns, selects       | 150-250ms     |
| Modals, drawers          | 200-500ms     |
| Marketing/explanatory    | Can be longer |

GSAP durations are in seconds (`duration: 0.2`). Bitrate's tokens (`--motion-fast`, `--motion-base`, `--motion-emphasis`) are in the motion guide and win where they differ.

**Rule: frequent UI animations stay short.** A 180ms dropdown feels more responsive than a 400ms one. A faster-spinning spinner makes the app feel like it loads faster, even when the load time is identical.

### Perceived performance

Speed in animation is not just about feeling snappy — it directly affects how users perceive your app's performance:

- A **fast-spinning spinner** makes loading feel faster (same load time, different perception)
- A **180ms select** animation feels more responsive than a **400ms** one
- **Instant tooltips** after the first one is open (skip delay + skip animation) make the whole toolbar feel faster

The perception of speed matters as much as actual speed. Easing amplifies this: `expo.out` at 0.2 s _feels_ faster than `power2.in` at 0.2 s because the user sees immediate movement.

## Springs and Spring-like Motion

Springs feel natural because they overshoot and settle like physical objects. GSAP has no physics spring; it gets the same feel from overshooting eases and from momentum.

| Need | GSAP |
| --- | --- |
| Small pop with character (Like, badge) | `ease: "back.out(1.6)"` … `back.out(4)` |
| Bouncy morph (tooltip, health panel) | `ease: "elastic.out(1, .75)"` |
| Release with momentum (drag, flick) | `InertiaPlugin` via `Draggable` (`inertia: true`) |
| Smoothly following a moving value | `gsap.quickTo` |

### When to use them

- Drag interactions with momentum
- Elements that should feel "alive" (like Apple's Dynamic Island)
- Gestures that can be interrupted mid-animation
- Decorative mouse-tracking interactions

### Pointer-following interactions

Tying visual changes directly to mouse position feels artificial because it lacks motion. Use `gsap.quickTo` so each new value is chased with an ease instead of applied immediately. It reuses one tween, so it is cheap at pointer-event rate and never goes through React state.

```js
// Without smoothing: feels artificial, instant
card.style.transform = `rotate(${mouseX * 0.1}deg)`;

// With quickTo: feels natural, has momentum
const rotateTo = gsap.quickTo(card, "rotation", { duration: 0.6, ease: "power3.out" });
window.addEventListener("pointermove", (e) => rotateTo(e.clientX * 0.1));
```

This works because the animation is **decorative** — it doesn't serve a function. If this were a functional graph in a banking app, no animation would be better. Know when decoration helps and when it hinders.

### Overshoot configuration

```js
// Subtle, the default for UI
gsap.to(el, { scale: 1, duration: 0.5, ease: "back.out(1.4)" });

// Playful (drag-to-dismiss, celebrations)
gsap.to(el, { y: 0, duration: 0.8, ease: "elastic.out(1, .6)" });
```

Keep overshoot subtle (`back.out(1.2–1.7)`) when used. Avoid bounce in most UI contexts. Use it for drag-to-dismiss and playful interactions.

### Interruptibility

A GSAP tween always starts from the element's current value, so a new tween on the same property retargets from wherever the old one stopped. Kill or overwrite the running tween; never queue behind it. When you click an expanded item and quickly press Escape, the closing tween starts from the current position.

```js
const toggle = (open) =>
  gsap.to(panel, { yPercent: open ? 0 : 100, duration: 0.35, ease: "power3.out", overwrite: "auto" });
```

`quickTo` and `InertiaPlugin` also carry velocity across interruptions; plain tweens restart their ease from the current position.

## Component Building Principles

### Buttons must feel responsive

Add a scale on `:active`. Press feedback is pure CSS — it runs on the compositor and needs no script. Bitrate uses `scale(0.98)`.

```css
.button {
  transition: transform 160ms ease-out;
}

.button:active {
  transform: scale(0.98);
}
```

This applies to any pressable element. The scale should be subtle (0.95-0.98).

### Never animate from scale(0)

Nothing in the real world disappears and reappears completely. Elements animating from `scale(0)` look like they come out of nowhere.

Start from `scale(0.9)` or higher, combined with opacity. Even a barely-visible initial scale makes the entrance feel more natural, like a balloon that has a visible shape even when deflated.

```js
// Bad
gsap.from(el, { scale: 0 });

// Good — autoAlpha also toggles visibility, so the element is not clickable while hidden
gsap.from(el, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: "expo.out" });
```

### Make popovers origin-aware

Popovers should scale in from their trigger, not from center. The default `transform-origin: center` is wrong for almost every popover. **Exception: modals.** Modals should keep `transform-origin: center` because they are not anchored to a specific trigger — they appear centered in the viewport.

Base UI exposes the trigger-relative origin as a CSS variable; popover enter/exit stays in CSS:

```css
.popover {
  transform-origin: var(--transform-origin);
}
```

If a popover is animated by GSAP instead, read the same variable:

```js
gsap.from(popover, {
  scale: 0.96,
  autoAlpha: 0,
  transformOrigin: getComputedStyle(popover).getPropertyValue("--transform-origin"),
  duration: 0.18,
  ease: "expo.out",
});
```

Whether the user notices the difference individually does not matter. In the aggregate, unseen details become visible. They compound.

### Tooltips: skip delay on subsequent hovers

Tooltips should delay before appearing to prevent accidental activation. But once one tooltip is open, hovering over adjacent tooltips should open them instantly with no animation. This feels faster without defeating the purpose of the initial delay. Base UI tooltips do this in CSS:

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Skip animation on subsequent tooltips */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

### Retarget, don't restart, for rapidly triggered UI

CSS transitions and GSAP tweens can be interrupted and retargeted mid-animation. CSS `@keyframes` and a timeline replayed with `restart()` jump back to zero. For any interaction that can be triggered rapidly (adding toasts, toggling states), retargeting produces smoother results.

```js
// Interruptible — each call continues from the current value
function setOpen(open) {
  gsap.to(toast, { yPercent: open ? 0 : 100, duration: 0.4, ease: "power3.out", overwrite: "auto" });
}

// Not interruptible — snaps to the start every time
enterTimeline.restart();
```

### Use blur to mask imperfect transitions

When a crossfade between two states feels off despite trying different easings and durations, add subtle `filter: blur(2px)` during the transition.

**Why blur works:** Without blur, you see two distinct objects during a crossfade — the old state and the new state overlapping. This looks unnatural. Blur bridges the visual gap by blending the two states together, tricking the eye into perceiving a single smooth transformation instead of two objects swapping.

```js
gsap.timeline()
  .to(content, { filter: "blur(2px)", opacity: 0.7, duration: 0.1, ease: "power2.in" })
  .call(swapContent)
  .to(content, { filter: "blur(0px)", opacity: 1, duration: 0.2, ease: "power3.out" });
```

Keep blur under 20px and on small, isolated elements. Heavy blur is expensive, especially in Safari, and Bitrate never animates blur on large surfaces.

### Animate enter states without a mounted flag

Base UI already marks mounting elements with `data-starting-style` and unmounting ones with `data-ending-style`; animate those in CSS. `@starting-style` does the same for elements outside Base UI:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

When the entrance is part of a GSAP sequence, animate from the hidden state inside `useGSAP`, which runs after mount and reverts on unmount — no `useEffect` + `mounted` state:

```jsx
useGSAP(() => {
  gsap.from(".toast", { yPercent: 100, autoAlpha: 0, duration: 0.4, ease: "power3.out" });
}, { scope: container });
```

## Transform Mastery

### Percent translation

Percentage translation is relative to the element's own size. Use `yPercent: 100` to move an element by its own height, regardless of actual dimensions. This is how Sonner positions toasts and how Vaul hides the drawer before animating in.

```js
// Works regardless of drawer height
gsap.set(drawer, { yPercent: 100 });

// Works regardless of toast height
gsap.from(toast, { yPercent: -100 });
```

Prefer `xPercent` / `yPercent` over hardcoded pixel values. They are less error-prone and adapt to content.

### scale scales children too

Unlike `width`/`height`, `scale` also scales an element's children. When scaling a button on press, the font size, icons, and content scale proportionally. This is a feature, not a bug.

### 3D transforms for depth

`rotationX`, `rotationY` and `z` with `transformPerspective` (or `transform-style: preserve-3d` on the parent) create real 3D effects. Orbiting animations, coin flips, and depth effects need no extra library.

```js
gsap.set(wrapper, { transformStyle: "preserve-3d" });
gsap.to(coin, { rotationY: 360, transformPerspective: 600, duration: 1.2, ease: "power3.inOut" });
```

### transform-origin

Every element has an anchor point from which transforms execute. The default is center. Set `transformOrigin` to match where the trigger lives for origin-aware interactions.

## clip-path for Animation

`clip-path` is not just for shapes. It is one of the most powerful animation tools, and GSAP tweens it like any other property. Keep it to small, isolated elements and one-shot transitions.

### The inset shape

`inset(top right bottom left)` defines a rectangular clipping region. Each value "eats" into the element from that side.

```js
// Reveal from left to right
gsap.fromTo(overlay,
  { clipPath: "inset(0 100% 0 0)" },
  { clipPath: "inset(0 0% 0 0)", duration: 0.2, ease: "power3.out" });
```

Keep the same units on both ends (`100%` → `0%`) so GSAP can interpolate them.

### Tabs with perfect color transitions

Duplicate the tab list. Style the copy as "active" (different background, different text color). Clip the copy so only the active tab is visible. Tween the clip to the new tab's box on tab change. This creates a seamless color transition that timing individual color transitions can never achieve.

### Hold-to-delete pattern

Press should be slow when it is deliberate; release always snaps back.

```js
const hold = gsap.fromTo(overlay,
  { clipPath: "inset(0 100% 0 0)" },
  { clipPath: "inset(0 0% 0 0)", duration: 2, ease: "none", paused: true, onComplete: confirmDelete });

button.addEventListener("pointerdown", () => hold.timeScale(1).play());
button.addEventListener("pointerup", () => hold.timeScale(10).reverse()); // 2 s / 10 = 0.2 s back
```

Keep the CSS `scale(0.98)` on `:active` for press feedback.

### Image reveals on scroll

Start hidden from the bottom and reveal once the image enters the viewport. Use `ScrollTrigger` with `once: true`; never a scroll listener.

```js
gsap.registerPlugin(ScrollTrigger);

gsap.from(image, {
  clipPath: "inset(0 0 100% 0)",
  duration: 0.8,
  ease: "power4.inOut",
  scrollTrigger: { trigger: image, start: "top 85%", once: true },
});
```

Prefer a CSS view timeline when the browser supports it and the effect needs no script.

### Comparison sliders

Overlay two images. Clip the top one and set the right inset from the drag position. No extra DOM elements needed.

```js
const setClip = gsap.quickSetter(top, "clipPath");
Draggable.create(handle, {
  type: "x",
  bounds: container,
  onDrag() {
    const right = 100 - (this.x / container.offsetWidth) * 100;
    setClip(`inset(0 ${right}% 0 0)`);
  },
});
```

## Gesture and Drag Interactions

Use `Draggable` (with `InertiaPlugin` for momentum). It already captures the pointer and follows only the first touch point, and `InertiaPlugin` tracks velocity, so the rules below are configuration rather than hand-written handlers.

### Momentum-based dismissal

Don't require dragging past a threshold. Dismiss when the distance is large enough **or** the flick is fast enough. A quick flick should be enough.

```js
gsap.registerPlugin(Draggable, InertiaPlugin);

InertiaPlugin.track(toast, "x"); // velocity tracking without a momentum throw

Draggable.create(toast, {
  type: "x",
  onRelease() {
    const velocity = Math.abs(InertiaPlugin.getVelocity(this.target, "x")); // px per second
    if (Math.abs(this.x) >= SWIPE_THRESHOLD || velocity > 110) dismiss();
    else gsap.to(this.target, { x: 0, duration: 0.3, ease: "power3.out" });
  },
});
```

Emil's threshold of ~0.11 px/ms is 110 px/s in GSAP's units.

### Damping at boundaries

When a user drags past the natural boundary (e.g., dragging a drawer up when already at top), apply damping. The more they drag, the less the element moves. Things in real life don't suddenly stop; they slow down first. In `Draggable`, set `bounds` and `edgeResistance` (about `0.65–0.85`).

### Pointer capture for drag

Once dragging starts, the element must receive all pointer events, even if the pointer leaves its bounds. `Draggable` does this; in a hand-written handler call `element.setPointerCapture(event.pointerId)`.

### Multi-touch protection

Ignore additional touch points after the initial drag begins. Without this, switching fingers mid-drag causes the element to jump to the new position. `Draggable` follows the first pointer; a hand-written handler returns early while a drag is active.

### Friction instead of hard stops

Instead of preventing upward drag entirely, allow it with increasing friction (`edgeResistance`). It feels more natural than hitting an invisible wall.

## Performance Rules

### Only animate transform and opacity

These properties skip layout and paint. Animating `padding`, `margin`, `height`, or `width` triggers all three rendering steps. In GSAP use `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation` and `autoAlpha`; for size changes use `Flip`.

### CSS variables are inheritable

Changing a CSS variable on a parent recalculates styles for all children. In a drawer with many items, updating `--swipe-amount` on the container causes expensive style recalculation. Set the transform on the element itself.

```js
// Bad: triggers recalc on all children
container.style.setProperty("--swipe-amount", `${distance}px`);

// Good: only affects this element
const setY = gsap.quickSetter(drawer, "y", "px");
setY(distance);
```

### GSAP runs on the main thread

GSAP updates every tween from one `requestAnimationFrame` ticker. It writes transforms as a matrix (promoted to a GPU layer during the tween with `force3D: "auto"`), caches transform values instead of reading layout, and smooths over dropped frames with `lagSmoothing`. It still needs the main thread: when the browser is busy loading a page or running scripts, a tween stutters where a CSS transition on `transform`/`opacity` keeps running on the compositor.

So:

- Simple, predetermined feedback (hover, press, Base UI enter/exit) stays in CSS.
- Sequenced, measured, pointer-driven or interruptible motion uses GSAP.
- Keep long tasks away from animated surfaces; start heavy work after the tween, or split it.

### Never read layout inside a tween

Measure before animating (or let `Flip.getState()` do it), then tween to the values. Reading `offsetHeight` or `getBoundingClientRect()` in `onUpdate` forces a layout every frame.

## Accessibility

### prefers-reduced-motion

Animations can cause motion sickness. Reduced motion means fewer and gentler animations, not zero. Keep opacity and color transitions that aid comprehension. Remove movement and position animations.

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s ease;
    /* No transform-based motion */
  }
}
```

```js
const mm = gsap.matchMedia();

mm.add(
  { full: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
  ({ conditions }) => {
    gsap.from(panel, conditions.full
      ? { xPercent: -100, duration: 0.35, ease: "power3.out" }
      : { autoAlpha: 0, duration: 0.15 });
  },
);
```

### Touch device hover states

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

Touch devices trigger hover on tap, causing false positives. Gate hover animations behind this media query; for GSAP hover effects, use the same query in `gsap.matchMedia()`.

## The Sonner Principles (Building Loved Components)

These principles come from building Sonner (13M+ weekly npm downloads) and apply to any component:

1. **Developer experience is key.** No hooks, no context, no complex setup. Insert `<Toaster />` once, call `toast()` from anywhere. The less friction to adopt, the more people will use it.

2. **Good defaults matter more than options.** Ship beautiful out of the box. Most users never customize. The default easing, timing, and visual design should be excellent.

3. **Naming creates identity.** "Sonner" (French for "to ring") feels more elegant than "react-toast". Sacrifice discoverability for memorability when appropriate.

4. **Handle edge cases invisibly.** Pause toast timers when the tab is hidden. Fill gaps between stacked toasts with pseudo-elements to maintain hover state. Capture pointer events during drag. Users never notice these, and that is exactly right.

5. **Retarget, don't restart, for dynamic UI.** Toasts are added rapidly. Keyframes restart from zero on interruption; transitions and GSAP tweens with `overwrite: "auto"` retarget smoothly.

6. **Build a great documentation site.** Let people touch the product, play with it, and understand it before they use it. Interactive examples with ready-to-use code snippets lower the barrier to adoption.

### Cohesion matters

Sonner's animation feels satisfying partly because the whole experience is cohesive. The easing and duration fit the vibe of the library. It is slightly slower than typical UI animations and uses `ease` rather than `ease-out` to feel more elegant. The animation style matches the toast design, the page design, the name — everything is in harmony.

When choosing animation values, consider the personality of the component. A playful component can be bouncier. A professional dashboard should be crisp and fast. Match the motion to the mood.

### The opacity + height combination

When items enter and exit a list (like Family's drawer), the opacity change must work well with the height change. Use `Flip` for the layout shift and tune the opacity tween alongside it. This is often trial and error. There is no formula — you adjust until it feels right.

```js
const state = Flip.getState(list.children);
list.append(newItem);
Flip.from(state, {
  targets: list.children, // include the new item so onEnter fires for it
  duration: 0.35,
  ease: "power3.out",
  onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }),
});
```

### Review your work the next day

Review animations with fresh eyes. You notice imperfections the next day that you missed during development. Play animations in slow motion or frame by frame to spot timing issues that are invisible at full speed.

### Asymmetric enter/exit timing

Pressing should be slow when it needs to be deliberate (hold-to-delete: 2 s `none`), but release should always be snappy (0.2 s out ease). This pattern applies broadly: slow where the user is deciding, fast where the system is responding. Exits run at about 0.6× the entrance with an `in` ease.

## Stagger Animations

When multiple elements enter together, stagger their appearance. Each element animates in with a small delay after the previous one. This creates a cascading effect that feels more natural than everything appearing at once.

```js
gsap.from(".item", {
  autoAlpha: 0,
  y: 8,
  duration: 0.3,
  ease: "power3.out",
  stagger: 0.05, // 50 ms between items
});
```

Keep stagger delays short (30-80ms between items). Long delays make the interface feel slow. Stagger is decorative — never block interaction while stagger animations are playing.

## Debugging Animations

### Slow motion testing

Play animations at reduced speed to spot issues invisible at full speed. Slow every GSAP animation at once with `gsap.globalTimeline.timeScale(0.25)` from the console, or attach `GSDevTools` in development to scrub a timeline. For CSS transitions, use the DevTools Animations panel.

Things to look for in slow motion:

- Do colors transition smoothly, or do you see two distinct states overlapping?
- Does the easing feel right, or does it start/stop abruptly?
- Is the transform-origin correct, or does the element scale from the wrong point?
- Are multiple animated properties (opacity, transform, color) in sync?

### Frame-by-frame inspection

Step through animations frame by frame in Chrome DevTools (Animations panel for CSS, Performance panel for GSAP). This reveals timing issues between coordinated properties that you cannot see at full speed.

### Test on real devices

For touch interactions (drawers, swipe gestures), test on physical devices. Connect your phone via USB, visit your local dev server by IP address, and use Safari's remote devtools. The Xcode Simulator is an alternative but real hardware is better for gesture testing.

## Review Checklist

When reviewing UI code, check for:

| Issue                                          | Fix                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `transition: all`                              | Specify exact properties: `transition: transform 200ms ease-out`   |
| `scale: 0` entry animation                     | Start from `scale: 0.95` with `autoAlpha: 0`                       |
| `in` ease on arriving UI                       | Switch to `expo.out` / `power3.out`                                |
| `transform-origin: center` on popover          | Use Base UI's `var(--transform-origin)` (modals are exempt — keep centered) |
| Animation on keyboard action                   | Remove animation entirely                                          |
| Long duration on frequent UI                   | Reduce to the motion guide's `--motion-fast` / `--motion-base`     |
| Hover animation without media query            | Add `@media (hover: hover) and (pointer: fine)` / `gsap.matchMedia` |
| Keyframes or `restart()` on rapid triggers     | Retarget with a tween and `overwrite: "auto"`, or `quickTo`         |
| GSAP tween of `width`/`height`/`top`/`left`    | Use `x`/`y`/`scale` or `Flip`                                      |
| GSAP in React outside `useGSAP`                | Move into `useGSAP` with a `scope` so it reverts on unmount        |
| Pointer value stored in React state            | `gsap.quickTo` / `quickSetter`                                     |
| Hover, press or Base UI enter/exit done in GSAP | Move to a CSS transition                                          |
| No reduced-motion branch                       | `gsap.matchMedia()` with `prefers-reduced-motion`                  |
| Same enter/exit transition speed               | Make exit faster than enter (about 0.6×)                           |
| Elements all appear at once                    | Add `stagger` (0.03–0.08 s between items)                          |
