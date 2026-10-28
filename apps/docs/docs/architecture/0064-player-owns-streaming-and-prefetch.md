# ADR-0064: The player element owns streaming, prefetch and mirrors

Status: Accepted

Date: 2026-10-27

## Context

[ADR-0039](./0039-player-as-svelte-custom-element-package.md) made the player a custom
element that owns playback while hosts only subscribe, but web-player kept its own engine:
two `<audio>` elements managed by React hooks (`useAudioSlots`, `useAudioPlayerEvents`) on
top of the CMAF/MSE loader of [ADR-0020](./0020-cmaf-range-mse-playback.md). #236 moves that
engine into `@bitrate/player`. Three questions needed a durable answer: who decides what plays
next, what happens to tracks with no CMAF manifest, and how several visible surfaces (the
desktop bar, the mobile island, the now-playing view, the picture-in-picture window) share
one playback.

## Decision

**The host decides what plays; the element decides how.** In streaming mode a host sets
`streaming` (its transport), `source` (what plays now) and `next` (what follows), each keyed
per play so the same track queued twice is two plays. The element resolves the manifest,
streams CMAF with adaptive bitrate, prefetches `next` into a second media element once the
current track nears its end, and when the host moves `source` to that key, switches to it at
once. It reports `statechange`, `play`, `pause`, `error` and `ended` with the play key; the
host's queue logic answers `ended` by moving `source` on. Queue, shuffle and repeat stay in
the host.

**Tracks without a manifest use a host-supplied legacy adapter.** `streaming.legacy` receives
the media element and owns the whole fallback chain; web-player passes hls.js, then native
HLS, then the progressive file. hls.js therefore stays a web-player dependency and never ships
in the package or reaches admin. Without an adapter the element plays the progressive file.
Removing the adapter is the cleanup once legacy tracks are re-encoded.

**Everything host-specific is injected.** Manifest lookup and byte ranges go through the
host's authenticated client (`resolveManifest`, `fetchRange`), resume positions through
`positions`, a constrained connection through `isConstrained`, and remembered bandwidth and
the debug switch through `configureCmafEngine`. The engine reads no `process.env`,
`localStorage` or `navigator.connection`.

**One element plays; the others mirror it.** `element.mirror = primary` makes an element
render and control `primary` without media of its own: its built-in layout and part elements
read the primary's controller, obtained through the primary's `requestPlayer`, which also
works across documents (the picture-in-picture window). web-player mounts one headless
`<bitrate-player chrome="none">` that plays, and every visible surface is a mirror.

**The resolveSource path stays.** Without `streaming` the element keeps the original
single-element `resolveSource` engine, so admin needs no change.

## Consequences

- web-player's `useAudioPlayer`, `useAudioSlots`, `useAudioPlayerEvents`, `attachCmafSource`
  and its two `<audio>` elements are gone; `useStreamingPlayer` only maps the store to the
  element and back.
- The element's public surface grows additively: `streaming`, `source`, `next`, `volume`,
  `muted`, `mirror`, `state`, `seek()` and the `statechange` event.
- A play asked for before a source has attached now starts on `canplay`. web-player used to
  wait for `progress`, which a small file may never fire.
- The CMAF path is now tested in a real browser on a fixture made by the API's own converter
  (`packages/player/scripts/make-cmaf-fixture.mjs`), including the drop to a lower rendition
  on a slow connection.
- The browser test project starts Chromium with `--autoplay-policy=no-user-gesture-required`,
  because media specs call `play()` without a user gesture.

## Alternatives considered

- **The element owns the queue too.** It would let the element advance without a round trip
  to the host, but queue, shuffle, repeat and Bitrate Connect sync are web-player domain logic
  admin does not have; keeping them in the host keeps the element generic.
- **hls.js inside the package.** Simpler for hosts, but it adds ~150 KB to every consumer,
  including admin, for a path ADR-0020 intends to retire.
- **Every surface its own playing element.** Each would buffer and play separately; one
  playing element with mirrors is the only way the four surfaces stay one playback.
