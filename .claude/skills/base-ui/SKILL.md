---
name: base-ui
description: Base UI primitive conventions for packages/ui-react — the parts/anatomy pattern, render props and composition, controlled vs uncontrolled state, portals and z-index, and accessibility guarantees you must not undo. Use when building or changing a ui-react component on top of @base-ui-components/react, or when a popup, dialog, or menu misbehaves.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Base UI — the unstyled primitive layer

`@base-ui-components/react` provides unstyled, accessible primitives. This repo styles them
with Tailwind v4 tokens and CVA in `packages/ui-react`; the primitives own behaviour,
keyboard interaction, focus management, and ARIA. **Base UI is the primitive library here —
not Radix.** Check what a neighbouring component already does before introducing a different
pattern.

## The parts pattern

Every primitive is a set of composable parts, not one component with many props:

```tsx
import { Select } from '@base-ui-components/react/select'

<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger className={cn(triggerVariants())}>
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner sideOffset={4}>
      <Select.Popup className={cn(popupVariants())}>
        <Select.Item value="a">
          <Select.ItemText>Option A</Select.ItemText>
        </Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
```

Wrap this anatomy once in `packages/ui-react` and export the composed component. Consumers
should not have to assemble parts — and should not have to know a `Positioner` exists.

## Composition — `render`

Base UI parts accept a `render` prop to change the element they render as, keeping their
behaviour and ARIA:

```tsx
<Select.Trigger render={<Button variant="outline" />} />
```

Use this instead of nesting a `<button>` inside a trigger, which produces nested interactive
elements — invalid HTML and broken keyboard behaviour.

## Controlled vs uncontrolled

`value`/`onValueChange` for controlled, `defaultValue` for uncontrolled. Passing both makes
the component controlled and the default is ignored. **Do not lift state into a store just
to make a popup open** — local `useState` is correct; a Zustand store for an open/closed flag
is state at the wrong layer.

## Portals, positioning, and z-index

`Portal` renders outside the DOM hierarchy, so parent `overflow: hidden` and stacking
contexts no longer clip the popup — that is why it exists.

- A component owns its own stacking layer through tokens. **`z-[9999]` is a red flag**
  (`Style-3`, `.claude/rules/styling.md`); if a popup renders behind something, find the
  competing stacking context.
- `Positioner` handles collision detection and flipping. Set `sideOffset`/`align` on it, not
  by hand with CSS transforms.
- **Popup width**: select/dropdown content is at least trigger width when options would
  otherwise clip. Do not bake one caller's width into a shared primitive — expose a variant
  or compose at the call site.

## Accessibility — do not undo it

The primitives already give you: roving focus, type-ahead, `Escape` to close, focus return
to the trigger on close, `aria-expanded`/`aria-controls`/`aria-selected`, and a focus trap in
modal surfaces.

Things that break those guarantees:

- adding your own `onKeyDown` that swallows arrow keys or `Escape`;
- setting `tabIndex` on a part that manages its own focus;
- replacing a part's rendered element with a `<div>` that has an `onClick` instead of using
  `render` with a real button;
- rendering a `Popup` outside its `Portal`/`Positioner`.

An icon-only trigger still needs an accessible name — the primitive cannot invent one.

## Animation

Base UI exposes data attributes for transition state (`[data-open]`, `[data-closed]`,
`[data-starting-style]`, `[data-ending-style]`). Style them with Tailwind data-attribute
variants or `motion`. **Not `tailwindcss-animate`** — that is Tailwind v3 only. Respect
`prefers-reduced-motion`.

Exit animations need the primitive to keep the element mounted while it plays; that is what
the ending-style attributes are for. An element that vanishes instantly on close usually
means the transition is on the wrong part.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@base-ui-components/react` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@base-ui-components/react/package.json').version"
   ```
2. **Then the official docs:** https://base-ui.com/react/overview/quick-start — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because Base UI is pre-1.0 and part names still move between releases.

## Related

- `ui-react-rules` skill — where components live and the search-before-adding workflow.
- `shadcn` skill — the generic composition methodology this package adapts.
- `tailwindcss` skill — the token utilities and CVA recipe used to style parts.
- `.claude/rules/styling.md` — popup width, overlay z-index, interaction details.
