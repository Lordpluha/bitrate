---
name: fsd
description: Canonical FSD slice scaffolding — explains why implement and .claude/templates own the initial shape of every new feature/, entity/, widget/, or views/ slice in the Next.js web player, and every new UI component in packages/ui-react, what each generated tree looks like (including the model/{schemas,dtos,responses} split and the client/server API class pair), and when to add real API methods or Zustand state versus leaving them out. Use whenever asked to create a new feature, entity, widget, or view slice in apps/web-player, a new component in packages/ui-react, or before hand-rolling any of those directories by hand.
metadata:
  version: "1.0.0"
  type: workflow
  author: lordpluha
license: MIT
---

# FSD scaffold — bitrate

`implement` applies this skill internally for every new `features/`, `entities/`,
`widgets/`, or `views/` slice in `apps/web-player`, and for every new UI component in
`packages/ui-react`. Do not hand-roll the initial tree; `.claude/templates/` is the
canonical shape.

`feature`, `entity`, `widget`, and `view` are Next.js-specific — they use `'use client'`
boundaries and the `@shared/api/client` / `@shared/api/server` split, so they only make
sense for `apps/web-player` (or a future Next.js app). `ui` scaffolds a framework-agnostic
`@bitrate/ui-react` component with no Next.js dependency.

## Entity template

```text
entities/<name>/
  api/
    index.ts
    <NamePascal>Api.ts          client-side API class (extends ClientApi)
    server/
      index.ts
      <NamePascal>Api.server.ts server-side API class (extends ServerApi, 'server-only')
  lib/.gitkeep
  model/
    index.ts
    schemas/<nameCamel>.schema.ts    Zod schema — source of truth for the entity type
    dtos/<nameCamel>.dto.ts          Create/Update input types
    responses/<nameCamel>.response.dto.ts  response shape, extend for joined/computed fields
  ui/index.ts
  index.ts
```

Replace the placeholder `id`-only schema with the real API contract before wiring
consumers. The client and server API classes start empty (no methods) — add typed methods
to each only once you've selected a real generated OpenAPI path; never invent an endpoint
string. Prefer a `use<Name>*` hook wrapping the client class over calling it directly from
UI (see the `react.md` rule's "Hooks-wrapping convention").

## Feature template

```text
features/<name>/
  api/
    index.ts
    <NamePascal>Api.ts          client-side API class, empty until the feature needs one
    server/
      index.ts
      <NamePascal>Api.server.ts server-side API class, empty until the feature needs one
  lib/.gitkeep
  model/
    index.ts
    <nameCamel>.types.ts        component Props type
    schemas/<nameCamel>.schema.ts    placeholder — only for a shape no entity already owns
    dtos/<nameCamel>.dto.ts          placeholder — same rule
    responses/<nameCamel>.response.dto.ts  placeholder — same rule
  ui/<NamePascal>.tsx
  ui/index.ts
  index.ts
```

The initial component is intentionally server-compatible. Add `'use client'` only when real
behaviour needs hooks, event handlers, context, or browser APIs. The `dtos/`, `schemas/`,
and `responses/` placeholders exist so the shape is ready if the feature ever needs its own
local data contract — but the default expectation is that a feature imports an entity's
schema/DTO rather than duplicating one (see `.claude/rules/forms.md` "Schema co-location
rule"). Populate the feature's own API classes only when it calls an endpoint no entity
already wraps.

## Widget template

```text
widgets/<name>/
  ui/<NamePascal>.tsx
  config/.gitkeep
  index.ts
```

Widgets compose features/entities/shared — they don't get `model/` or `api/` segments by
default. `config/` is for static data (nav links, feature lists); delete it if the widget
doesn't need any.

## View template

```text
views/<name>/
  ui/<NamePascal>.tsx
  index.ts
```

Views assemble widgets/features for one route and hold no business logic of their own —
just composition. Route files under `app/` stay thin adapters that render a view.

## UI-kit template (`packages/ui-react`)

```text
components/ui/<kebab-name>/
  <kebab-name>.tsx              cva + cn() + forwardRef, per styling.md
  <kebab-name>.stories.tsx
  <kebab-name>.unit-spec.tsx
  <kebab-name>.int-spec.tsx
  <kebab-name>.snapshot-spec.tsx
  <kebab-name>.screenshot-spec.tsx
  index.ts
```

Before scaffolding, search existing `@bitrate/ui-react` exports and the shadcn registry —
see the `ui-react-rules` skill. The scaffold does not wire the new component into
`components/ui/index.ts` or the package barrel; do that as the next step, and reuse an
existing variant axis instead of inventing one where one already covers the need.

## Add only what the slice needs

- API hooks belong in `api/` and use the existing OpenAPI React Query client, or wrap the
  scaffolded `<Name>Api`/`<Name>ServerApi` classes.
- Templates do not invent an endpoint string: OpenAPI endpoint literals are compile-time
  checked, so the developer adds the first method only after selecting a real generated
  path.
- Zustand belongs in `model/<name>Store.ts` only for shared client state.
- Server state belongs in React Query, not Zustand.
- Pure transformations belong in `lib/`.
- Slice-internal files stay internal; `index.ts` exports only the public surface. Never
  re-export `api/server/` from the slice's public barrel — `server-only` throws if that
  barrel is ever imported from a Client Component.

## Evolving the convention

Change the files under `.claude/templates/` first, then update this skill and checklist
item FSD-5 together. Templates use `__NameKebab__`, `__NameCamel__`,
`__NamePascal__`, and `__Layer__` placeholders.

## Related rules and skills

- `web-player-rules` — the FSD layer rules this scaffold produces slices for.
- `ui-react-rules` skill — search-before-adding workflow for the `ui` kind.
- `project-conventions` — the cross-cutting rules this file specializes.
