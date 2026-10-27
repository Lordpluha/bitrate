# ADR-0062: Player variants and public part elements

Status: Accepted

Date: 2026-10-27

## Context

[ADR-0039](./0039-player-as-svelte-custom-element-package.md) made the player one custom
element, `<bitrate-player>`, and declared `PlayerChrome = 'bar' | 'mini' | 'none'` without
wiring it to anything. The element rendered a single horizontal bar, and only the `on*`
callbacks decided which buttons showed. That is enough for `apps/admin`'s preview player but
not for `apps/web-player`, which needs four visually distinct surfaces from the same playback
state (the desktop bar, the mobile mini player, the full-screen now-playing view and the
picture-in-picture window), or for future hosts whose surface no built-in layout covers.

## Decision

**`chrome` selects a built-in layout.** `<bitrate-player chrome="bar|mini|expanded|floating|none">`
renders one of four layouts or none. `bar` stays the default and is the previous markup, so a
host that sets no `chrome` sees no change. An unknown value falls back to `bar`.

**A layout decides which controls it can show; the callbacks still decide whether they do.**
A button renders only when the layout includes it *and* the root has its `on*` callback (Play
needs none). `mini` shows Play and Next, `floating` Previous, Play and Next, `expanded` and `bar`
everything.

**The parts are public custom elements a host can compose itself.** `bitrate-player-cover`,
`-meta`, `-transport`, `-seek`, `-volume`, `-actions`, `-quality` and `-error` render one piece
each. Once the host puts any of them inside `<bitrate-player>`, the built-in layout steps aside
(detected through the root's `<slot>`, ignoring whitespace-only text) and the host's own markup
and CSS lay them out. `-transport` and `-actions` take a `controls` attribute listing the
buttons they may show, with the same rule as the layouts.

**Parts find their root through the Context Protocol.** On connect a part dispatches a
bubbling, composed `context-request` event; the nearest root answers with its controller, a
read-only object of getters over the root's reactive state plus the playback handlers. The
root attaches its listener in its constructor (Svelte's `customElement.extend`), so it exists
before any child part connects, and queues requests until its component mounts. A part with no
root renders nothing. The root stays the single owner of `<audio>`, the engine and every
host-facing property; parts never take playback props of their own.

**The built-in layouts reuse the internal parts, not the part elements.** A layout renders
the same internal Svelte components the part elements wrap, inside the root's own shadow tree.
That keeps the default `bar` pixel-identical and keeps its container queries working, which
nested shadow roots would not guarantee.

**Styling stays CSS custom properties, plus `::part()`.** Sizes and colours a layout changes are
`--bitrate-player-*` properties (cover and Play size, icon scale, title size, track height,
radius, background) falling back to the existing `--color-*` tokens, and inner nodes carry
`part` names a host can target from outside.

`defineBitratePlayer()` registers the root first and then every part from one dynamically
imported registry module, keeping the SSR and double-registration guards of ADR-0039.

## Consequences

- `apps/admin` needs no change: no `chrome`, no children, the same bar.
- `apps/web-player` can move each of its four surfaces onto `<bitrate-player chrome=…>`, or
  compose parts where its design differs (#236, #237).
- The contract grows: `BITRATE_PLAYER_CHROMES`, `BITRATE_PLAYER_PART_TAG`, the control-name
  unions and the part element interfaces. Parts are additive; nothing existing was renamed.
- A new built-in layout is a new file under `src/element/layouts/` built from the internal
  parts; a new part element is an internal part plus a thin wrapper and a registry entry.
- Parts inside a host's own shadow root still work, because the request event is composed.

## Alternatives considered

- **Built-in layouts only, behind `chrome`.** Simpler and what the first draft of #235
  proposed, but every surface a host needs would have to become a package layout. Rejected by
  the owner in favour of public parts.
- **The parts render inside the built-in layouts as nested custom elements.** One code path for
  both modes, but the default bar would lose its container queries and gain eight shadow roots;
  the internal parts give the same reuse without that cost.
- **Lit's `@lit/context` for the protocol.** Implements the same Context Protocol, but adds Lit
  as a dependency to a Svelte package for about forty lines of code.
