---
name: biome
description: Biome lint and format conventions for this monorepo — the root config and per-workspace overrides, safe vs unsafe fixes, the FSD import-boundary rules enforced through noRestrictedImports, and how to handle a rule you genuinely need to disable. Use when fixing a lint failure, changing a biome.json, or when formatting fights you.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Biome — lint + format

One tool for both, replacing ESLint and Prettier. Config is layered: `biome.json` at the
root, extended by per-workspace configs (`apps/api/`, `apps/web-player/`,
`apps/web-artists/`, `packages/ui-react/`, `packages/contracts/`, `packages/ncs-parser/`).

`apps/mobile` is the exception — it uses `eslint-config-expo`, not Biome.

## Commands

```bash
pnpm lint                                   # lint everything
pnpm format                                 # format --write everything
pnpm exec biome check --write <path>        # lint + format + safe fixes, one path
pnpm exec biome check --write .             # safe fixes, everywhere
pnpm exec biome check --write --unsafe .    # also applies unsafe fixes — review the diff
```

`--write` applies **safe** fixes only: changes Biome can prove preserve behaviour. Unsafe
fixes can change semantics, so `--unsafe` is a thing you run deliberately and then read the
diff of, never a reflex.

A `format-on-edit` hook runs `biome format --write` after every Edit/Write
(`.claude/hooks/format-on-edit.sh`), so formatting should never be something you fix by
hand.

## Style the config enforces

2-space indent, single quotes, **no semicolons**, trailing commas, 100-char lines. Do not
fight these in a file; if a line is awkward, the code usually wants restructuring.

## The rules that matter most here

- **`noRestrictedImports`** — this is where the **FSD layer boundaries** are enforced. A
  violation means an import flowed upward (`entities` reaching into `features`) or sideways
  (feature → feature), or reached past a slice's public `index.ts` barrel. This is an
  architecture error reported as a lint error: fix the import direction, never the rule.
  See `.claude/rules/fsd-web-player.md`.
- **`noUnusedVariables`** — usually an import left behind. Remove it rather than prefixing
  with `_`.
- **`noExplicitAny`** — replace with `unknown` and narrow, or with the real type. Production
  `any` is a non-negotiable in `.claude/rules/typescript.md`.
- **Import organisation** — auto-fixed by `biome check --write`; never hand-sort.

## Disabling a rule

In order of preference:

```ts
// biome-ignore lint/suspicious/noExplicitAny: third-party declaration has no exported type
```

A `biome-ignore` **requires** a reason after the colon, and that reason is the whole point —
it is what tells the next reader whether the suppression is still true. One line, one rule,
narrowest scope.

Turning a rule off in `biome.json` is a project-wide decision, not a way past one file. If a
rule is genuinely wrong for this codebase, say so and change it deliberately; do not disable
it to make a diff green.

Never suppress `noRestrictedImports`. An FSD violation is a design problem, and silencing it
moves the cost to whoever untangles the layers later.

## Per-workspace configs

Each workspace's `biome.json` extends the root and adds only what differs — `apps/api` has
the largest override set because NestJS decorators and DI patterns legitimately trip rules
written for plain TypeScript. Add a rule override at the **narrowest** level that fixes it:
one file's `biome-ignore` before a workspace override, a workspace override before the root.

## Gotchas

- **Biome does not type-check.** `pnpm lint` passing says nothing about types; `pnpm
  check-types` is a separate gate and both must be green.
- **Generated files** (`packages/contracts`, SVGR output) keep their generator's style. Do
  not hand-edit them to satisfy a lint rule — fix the generator or scope the rule.
- **`biome check` vs `biome lint`** — `check` is lint + format + import sorting; `lint` is
  lint only. The mechanical pass wants `check`.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@biomejs/biome` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@biomejs/biome/package.json').version"
   ```
2. **Then the official docs:** https://biomejs.dev/reference/configuration/ — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because rule names and the config schema changed between Biome 1 and 2.

## Related

- `.claude/rules/code-style.md` — the four mechanical commands and their pass/fail contract.
- `.claude/rules/fsd-web-player.md` — the layer rules `noRestrictedImports` encodes.
- `.claude/rules/typescript.md` — `any`, suppression, and naming rules.
