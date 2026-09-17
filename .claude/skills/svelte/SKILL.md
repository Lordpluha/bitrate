---
name: svelte
description: Svelte 5 runes and custom-element mode conventions for packages/player — props vs attributes, $host() for dispatching events, shadow DOM, prop reflection, and CSS injected into the shadow root. Use when writing or reviewing a .svelte file, changing <svelte:options>, or when a custom-element prop/attribute/event does not behave as expected.
---

# Svelte 5 + custom elements

Scoped to `packages/player`, the one place in this monorepo that uses Svelte. Read
`.claude/rules/player-rules.md` first — it is project law; this skill is framework mechanics.
Every claim here is sourced from the official Svelte 5 docs
(`https://svelte.dev/docs/svelte`) and the `@sveltejs/vite-plugin-svelte` docs — verify
against them, not memory, before relying on an API this skill does not cover.

## Runes, in one paragraph

Svelte 5 components are plain functions under the hood, not classes. State is explicit:
`$state(...)` for reactive local state, `$derived(...)` for computed values, `$effect(...)`
for side effects tied to the component's lifecycle, and `$props()` to read the props object
(destructure it: `let { chrome = 'bar' } = $props()`). There is no `export let` — that is
Svelte 4 legacy-mode syntax and does not appear in this package.

## Compiling a component as a custom element

A component becomes a custom element via `<svelte:options customElement={{ ... }}>` **and**
the compiler option `customElement: true` set globally, in `vite.config.ts`'s `svelte()`
plugin call (`compilerOptions: { customElement: true }`) or in `svelte.config.js`. Setting
only one of the two does not work: the per-component `<svelte:options>` block says *how* to
compile this component as a custom element; the global flag says *whether* custom-element
compilation is enabled for the project at all. `packages/player`'s `vite.config.ts` and
`vitest.config.ts` (`browser` project) both set the global flag; `svelte-check` reads it from
`svelte.config.js` for `check-types`.

```svelte
<svelte:options customElement={{ shadow: 'open' }} />

<script lang="ts">
  let { chrome = 'bar' }: { chrome?: 'bar' | 'mini' | 'none' } = $props()
</script>
```

`customElement` can be a bare string (used as the tag name — registers on import, no guard
possible) or an object. `packages/player` deliberately **omits `tag`** on every component: an
object without `tag` compiles the component with a static `.element` constructor available for
manual registration, but does not call `customElements.define` itself. That is what makes the
SSR-guarded, double-define-guarded `defineBitratePlayer()` in `src/element/index.ts` possible
— see `.claude/rules/player-rules.md` § "SSR guard and `defineBitratePlayer()`". Registering
straight from `tag` would register unconditionally at import time, unguarded.

### A component with no `<script>` block breaks the type import

If a `.svelte` file with `<svelte:options customElement={...}>` has no `<script>` block at
all, `svelte-check` cannot generate a correct virtual declaration for it, and any `.ts` file
that imports it fails with `implicitly has an 'any' type` — pointing at the *importing* line,
not the component. Give every custom-element component an explicit `<script lang="ts"></script>`
block, even an empty one, the moment anything outside the `.svelte` file imports it.

### Registering the element

```ts
import MyElement from './MyElement.svelte'

customElements.define('my-element', MyElement.element)
```

`.element` is `typeof HTMLElement | undefined` on the real compiled type — `undefined` only
if the component was never compiled with `customElement` enabled. `svelte-check` resolves this
correctly from the real `.svelte` source; a plain `tsc` pass (as `vite-plugin-dts` runs)
only sees Svelte's own generic `declare module '*.svelte'` ambient shim, typed as the older
`LegacyComponentType`, which has no `.element` member. `src/element/index.ts` asserts the
accurate shape once, locally, rather than fighting that ambient declaration — see the file for
the exact pattern.

## Props vs. attributes

A custom element's props are plain JS properties by default — set `el.propName = value` for
anything richer than a string (an array, an object, a function). Attributes are what HTML
markup can set (`<bitrate-player chrome="mini">`), and only strings cross that boundary
without help. Configure the mapping per prop under `customElement.props`:

| Option | Effect |
|---|---|
| `attribute: '<name>'` | Use a different attribute name than the lowercased prop name |
| `reflect: true` | Prop changes write back to the DOM attribute (off by default) |
| `type: 'String' \| 'Boolean' \| 'Number' \| 'Array' \| 'Object'` | How an attribute value coerces into the prop (default `'String'`) |

A `PlayerChrome` prop, for instance, stays a plain string attribute — no `type` override
needed. A future `queue` prop (an array of track objects) would need to be set as a DOM
property from the host, not an attribute, unless `type: 'Array'` is declared and the host is
willing to serialize it into a string attribute — usually the property route is simpler for
non-primitive data.

## Dispatching events with `$host()`

Inside a component compiled as a custom element, `$host()` returns the host `HTMLElement`
(the actual `<bitrate-player>` node in the DOM). Use it to dispatch native `CustomEvent`s
outward, rather than reaching for `createEventDispatcher` (a Svelte 4 API not used in runes
mode):

```svelte
<svelte:options customElement={{ shadow: 'open' }} />
<script lang="ts">
  function emitPlay() {
    $host().dispatchEvent(new CustomEvent('play'))
  }
</script>
```

Note this uses the object form with no `tag`, not the bare-string form (`customElement="bitrate-player"`) — see "Registering the element" above for why: a bare string registers unconditionally at import time, which is exactly what `packages/player` avoids to stay SSR-safe.

A consumer listens the DOM way, `element.addEventListener('play', handler)`, or — inside
another Svelte component — with the `on<name>` prop shorthand (`onplay={handler}` on the
custom element tag in markup). `packages/player`'s `contract` subpath is where these event
names get a single named, exported source of truth once the real player exists — do not
hand-roll the string `'play'` at each call site.

## Shadow DOM and styling

`shadow: 'open'` (or the object form, e.g. `{ mode: 'open', clonable: true }`) attaches an
open shadow root; `'none'` renders with no shadow root at all — no style encapsulation, no
`<slot>` support. `packages/player` always uses an open shadow root: `'closed'` would block
the host page's devtools and any first-party test harness from inspecting the rendered DOM,
which is a debugging cost this package should not impose on every consumer.

A component's `<style>` block is scoped and injected **into the shadow root**, not into the
host document — the compiled output shows this as a call that appends a `<style>` node
alongside the component's markup inside the custom element's shadow tree. That is exactly what
makes Tailwind unusable here (see `.claude/rules/player-rules.md` § "Styling") and CSS custom
properties the right tool: a `var(--color-foreground)` reference in a shadow-scoped `<style>`
block still resolves against whatever the *host document* set on `:root` or an ancestor,
because custom property inheritance crosses the shadow boundary even though selectors and
rules do not.

## Component lifecycle inside a custom element

The wrapped Svelte component is **not** created synchronously when the custom element is
constructed — it mounts on the next tick after `connectedCallback` fires, and unmounts on the
next tick after `disconnectedCallback` fires. Properties assigned to the element before
insertion (e.g. `el.chrome = 'mini'` before `document.body.append(el)`) are queued and applied
once the component actually mounts, so setting a prop early never silently drops it. Exported
component functions are the exception: they are not callable until after the component has
actually mounted, so code that needs a function available immediately on construction should
use the `extend` compiler option instead (wrapping the generated custom element class) rather
than relying on `$host()` timing.

Updates batch to the next tick too — a synchronous DOM move that temporarily detaches and
reattaches the element within the same tick does not tear down and remount the inner
component.

## What this skill does not cover

SvelteKit, Svelte stores (`writable`/`readable` — largely superseded by runes for new code),
transitions/animations, and server-side Svelte compilation. None of those are part of
`packages/player`'s E0 scope; consult the official docs directly if a later stage needs them.
