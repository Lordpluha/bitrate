---
name: architecture-checklist
description: The mechanical review checklist walked before a PR — FSD layering, NestJS controller/Swagger rules, TypeScript and React conventions, state ownership, design-token usage, code-principle limits, forms, and test depth, each with the exact command or grep that proves it. Use when reviewing a diff, preparing to open or update a PR, or deciding whether a change is finished.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Architecture checklist

Verification list walked by `sp-reviewer` (the heavy review specialist, auto-invoked by
the `sp-*-developer` agents on diffs over 100 lines/5 files, or dispatched by
`/sp-implement --review`).
`/sp-implement --session` self-checks against this list in-session for smaller diffs, and
human reviewers use it before merging. Each item states the rule, how to check it, and which
file owns the full rationale.

## FSD rules (web-player)

**FSD-1 — Layer direction: imports flow downward only (`app → views → widgets → features → entities → shared`).**
Check: `pnpm lint` — any `noRestrictedImports` error from Biome's FSD config IS a violation. Surface every match verbatim.
→ `.claude/rules/fsd-web-player.md` § "Layer order"

**FSD-2 — Cross-slice imports go through the slice's `index.ts` barrel.**
Check: grep for `from '@/entities/[^']+/[^']+'` (three-segment paths) in files outside that slice.
→ `.claude/rules/fsd-web-player.md` § "Public API rule"

**FSD-3 — Cross-slice imports at the same layer level are forbidden.**
Feature importing from another feature, entity from another entity, etc.
Check: `pnpm lint` catches this; also manually scan new feature/entity imports.
→ `.claude/rules/fsd-web-player.md` § "Cross-layer import table"

**FSD-4 — New slices have `index.ts` barrel.**
Check: `git diff --name-only` → for each new `features/`, `entities/`, `widgets/`, or `views/` directory, verify `index.ts` exists.
→ `.claude/rules/fsd-web-player.md` § "Slice anatomy"

**FSD-5 — New feature/entity/widget/view slices and ui-react components conform to canonical templates.**
A new feature must have `ui/<Name>.tsx`, segment barrels, `model/<name>.types.ts`,
`model/{schemas,dtos,responses}/`, `index.ts`, and the `api/` (with `<Name>Api.ts` +
`api/server/<Name>Api.server.ts`) + `lib/` segments. A new entity must have segment
barrels, `model/schemas/<name>.schema.ts`, `model/dtos/<name>.dto.ts`,
`model/responses/<name>.response.dto.ts`, `index.ts`, and the same `api/` + `lib/` + `ui/`
segments. A new widget must have `ui/<Name>.tsx`, `index.ts`, and a `config/` segment. A
new view must have `ui/<Name>.tsx` and `index.ts`. A new `packages/ui-react` UI component
must have `<name>.tsx`, `.stories.tsx`, `.unit-spec.tsx`, `.int-spec.tsx`,
`.snapshot-spec.tsx`, `.screenshot-spec.tsx`, and `index.ts`.
Check: `git diff --name-only | grep 'apps/web-player/src/\(features\|entities\|widgets\|views\)/\|packages/ui-react/src/components/ui/'` — for each new slice/component directory verify the required files exist.
→ `.claude/templates/`, the `fsd` skill

## NestJS API rules

**API-1 — Swagger decorators are in `decorators/` — never inline in controllers.**
Check: grep for `@ApiOperation\|@ApiResponse\|@ApiParam\|@ApiBody\|@ApiQuery` directly in `*.controller.ts` files. Any match outside a decorator factory is a FAIL.
→ `.claude/rules/api-rules.md` § "Swagger decorator pattern"

**API-2 — Controllers are thin — no Prisma, no business logic.**
Check: grep for `this.prisma` or `PrismaService` in `*.controller.ts` files. Any match is a FAIL.
→ `.claude/rules/api-rules.md` § "Controllers — thin by design"

**API-3 — Cross-module imports go through the module's `index.ts` barrel.**
Check: grep for `from '@modules/<name>/[^']+'` (three-segment paths) — any match outside the module itself is a FAIL.
→ `.claude/rules/api-rules.md` § "Path aliases (apps/api)"

**API-4 — Errors thrown are NestJS HttpExceptions, not manual response objects.**
Check: grep for `return { error:` or `return { message:` in service/controller files. Flag any non-exception error return.
→ `.claude/rules/api-rules.md` § "Errors"

## TypeScript rules

**TS-1 — Named types in all signature positions — no inline `{ ... }` shapes or unnamed literal unions.**
Check: semantic pass. Grep for `: {` in function parameter positions as a signal. `Record<K, V>` and built-in generics are fine. For literal unions: `grep -rn ": '[^']*' | '[^']*'" apps/web-player/src --include="*.ts" --include="*.tsx"` — any inline literal union in a signature is a FAIL.
→ `.claude/rules/typescript.md` § "Named types"

**TS-2 — React: named imports only — no `React.` namespace access.**
Check: `grep -r "React\." apps/web-player/src --include="*.tsx" --include="*.ts"` — any match for `React.useState`, `React.useEffect`, etc. is a FAIL.
→ `.claude/rules/typescript.md` § "React imports"

**TS-3 — No relative imports crossing module/slice boundaries.**
Check: `grep -r "from '\.\." apps/web-player/src` and `grep -r "from '\.\." apps/api/src` — must return nothing across boundaries (within the same file's directory is OK in API).
→ `.claude/rules/typescript.md` § "Imports"

**TS-4 — No `//` line comments in `apps/web-player/src/` — TSDoc `/** */` only.**
Check: `grep -rn "^\s*//" apps/web-player/src --include="*.ts" --include="*.tsx"` — any match outside generated files is a FAIL.
→ `.claude/rules/typescript.md` § "TSDoc style"

**TS-5 — No `any` or TypeScript suppression shortcuts in changed production source.**
Check: `rg -n '\bany\b|@ts-ignore|@ts-expect-error' <changed-source-files>`. Review
legitimate third-party declaration boundaries; production `@ts-ignore` is always a FAIL.
→ `.claude/rules/typescript.md` § "No `any` and no suppression shortcuts"

**TS-6 — Role suffix and test placement match the owning runner.**
Check changed files against `.claude/rules/typescript.md` § "File naming" and "Test
placement". A spec in a directory its runner does not discover is a FAIL.

## React rules (web-player)

**React-1 — `'use client'` boundary is as deep as possible.**
Check: semantic pass. A component using `'use client'` that could be a Server Component (no hooks, no browser API) is a review signal.
→ `.claude/rules/react.md` § "Server vs Client components"

**React-2 — Interactive elements use semantic HTML.**
Check: grep for `<div onClick\|<span onClick` in `.tsx` files — any match is a FAIL.
→ `.claude/rules/react.md` § "Accessibility baseline"

**React-3 — `ROUTES` constant used for all navigation — no inline path strings.**
Check: `grep -r 'href="/' apps/web-player/src` and `grep -r "router.push('" apps/web-player/src` — any match is a FAIL.
→ `.claude/rules/react.md` § "Routing"

**React-4 — Route files are adapters; full screen composition lives in `views/`.**
Check changed `app/**/page.tsx` files for large local component trees, feature orchestration,
or duplicated business logic. They may read params/server data and render a view.
→ `.claude/rules/react.md` § "Routing", ADR-0010

**React-5 — Accessibility baseline is preserved.**
Check labels, semantic controls, keyboard operation, focus restoration, reduced motion,
target size, and 320px/400%-zoom reflow for changed UI.
→ `apps/docs/docs/brand/a11y.md`

## State rules (web-player)

**State-1 — New client state uses an owning-slice Zustand store; no new Redux slices.**
Check changed files for new `createSlice` usage and concrete stores under `shared/store/`.
→ `.claude/rules/react.md` § "State management"

**State-2 — Server state stays in React Query.**
Check for API fetching in `useEffect` or duplicated API data copied into Zustand.
→ `.claude/rules/react.md` § "State management"

**State-3 — Persisted/auth-bound stores follow the target migration contract.**
Persist narrowly with `partialize`; expose `reset()` for auth-bound state; do not claim the
shared factory/registry exists until implemented.
→ ADR-0005

## Code quality

**Quality-1 — No hardcoded hex colors in `.tsx` or `.css` outside the token layer.**
Check: `grep -rn "#[0-9a-fA-F]\{3,8\}" apps/web-player/src --include="*.tsx" --include="*.css"`.
→ `.claude/rules/styling.md` § "Forbidden patterns"

**Quality-2 — Commit message follows Conventional Commits format.**
Check: `git log --oneline -5` — headers must match `<type>(<scope>): <summary>`.
→ `.claude/rules/commit-style.md`

**Quality-3 — No new unused files, exports, or dependencies.**
Check: `pnpm knip`. Verify framework/generated false positives before suppressing them.
→ `.claude/rules/code-style.md` § "`pnpm knip`"

**Quality-4 — Generated sources are regenerated, not hand-edited.**
For token, icon, and OpenAPI contract changes, inspect the source and generated diff together.
→ `.claude/rules/monorepo.md` § "Asset generation pipelines"

**Quality-5 — A changeset exists for any user/behaviour-visible change.**
Check: `git diff --name-only -- .changeset/` (or `ls .changeset/*.md`) has a new file when
`apps/*`/`packages/*` behaviour changed. Not required for pure docs/rules/test-only/chore
diffs.
→ `.claude/rules/commit-style.md` § "Changesets"

## Code principles (web-player)

**Principles-1 — SOLID / DRY / KISS + component decomposition.**
Check: semantic pass. A component that fetches, transforms, and renders is three responsibilities — split them. A component that copies logic from another is DRY violation — extract.
→ `.claude/rules/code-principles.md` § "SOLID", "DRY", "Component decomposition"

**Principles-2 — ≤ 100 logic lines per `.tsx`.**
Check: `find apps/web-player/src -name "*.tsx" | xargs wc -l | awk '$1 > 130' | sort -rn` — any file over 130 total lines is a review signal. Count logic lines manually (exclude blanks + comments).
→ `.claude/rules/code-principles.md` § "Component size"

**Principles-3 — ≤ 5 own declared props per component.**
Check: semantic pass. Inspect the `<Component>Props` type — count only the fields declared directly (not inherited `HTMLAttributes` or `VariantProps`). Over 5 with no TSDoc justification is a FAIL.
→ `.claude/rules/code-principles.md` § "Props"

**Principles-4 — ≤ 2 `useEffect` calls per component.**
Check: `grep -c "useEffect(" <file>.tsx` — any file with > 2 matches is a review signal. Verify the actual count in the component body.
→ `.claude/rules/react.md` § "useEffect budget"

## Style rules (web-player)

**Style-1 — All `className` merges use `cn()` from `@spotify/ui-react`.**
Check: grep for template literals with class strings — `className={\`.*\`}` — any concatenation outside `cn()` is a FAIL.
→ `.claude/rules/styling.md` § "Forbidden patterns"

**Style-2 — Variant components use CVA, never raw string concatenation.**
Check: semantic pass. A component with multiple visual variants that doesn't use `cva(...)` is a review signal.
→ `.claude/rules/styling.md` § "The cn() + CVA recipe"

**Style-4 — No Tailwind built-in colour scale, and no `dark:` variant.**
`slate`/`gray`/`zinc`/`stone`/`amber`/`yellow`/`lime`/`emerald`/`teal`/`cyan`/`sky`/`indigo`/`violet`/`fuchsia`/`pink`/`rose` bypass the token pipeline entirely — they lint clean but the theme switch cannot reach them. `dark:` compiles to a `prefers-color-scheme` media query here, so it follows the OS rather than the app's theme class.
Check: `pnpm check:tokens` — any finding IS a violation. Also grep changed files for `dark:`.
→ `.claude/rules/styling.md` § "Why stock Tailwind colours are worse than a hex literal"

**Style-3 — Responsive UI and interaction details follow the token/a11y contract.**
Check mobile stacking, full-width controls, focus visibility, target size, popup width,
overlay z-index, and reduced-motion behaviour.
→ `.claude/rules/styling.md`, `apps/docs/docs/brand/a11y.md`

## Form rules (web-player)

**Form-1 — Zod is the validation source and types are inferred.**
Check for duplicated hand-written form value interfaces or duplicate schemas.
→ `.claude/rules/forms.md`

**Form-2 — Fields are labelled and errors are programmatically connected.**
Check `aria-invalid`, `aria-describedby`, and announced error messages.
→ `.claude/rules/forms.md`, `apps/docs/docs/brand/a11y.md`

**Form-3 — Shared form primitives are reused before creating another abstraction.**
Check `@spotify/ui-react` exports and existing feature wrappers.
→ `.claude/rules/forms.md` § "Shared form composition"

## Test rules (`ui-react`)

**Test-1 — Vitest specs use the suffix and project matching their concern.**
Unit: `.unit-spec.tsx`; interaction/composition: `.int-spec.tsx`; DOM snapshot:
`.snapshot-spec.tsx`; browser visual: `.screenshot-spec.tsx`.
Check: inspect changed specs and `packages/ui-react/vitest.config.ts`.
→ the `vitest` skill

**Test-2 — Component tests are co-located and assert observable behaviour.**
Check: changed specs live beside their component; role/label queries are preferred;
tests do not inspect private implementation state.
→ the `vitest` skill

**Test-3 — Screenshot updates are intentional and bounded.**
Check: screenshot specs render a deterministic subject and use
`toMatchScreenshot()`; changed baselines correspond only to changed specs.
→ the `playwright` skill

**Test-4 — New specs cover a failure path, not only the happy path.**
Any new spec for logic that can fail asserts at least one negative case — invalid/missing
input, a not-found record, a rejected mutation, a failed guard. In `apps/api` the assertion
names the exact exception. A positive-only spec for fallible logic is a review signal, and a
coverage percentage is never the justification.
Check: `rg -l 'toThrow|rejects|toBeInvalid' <changed spec files>`; for a changed spec with no
match, confirm from the diff that the code under test genuinely cannot fail.
→ `.claude/rules/testing.md` § "Coverage — depth before percentage"

## Mechanical pass commands

Run before opening a PR:
```bash
pnpm lint        # Biome — zero errors baseline
pnpm check-types # tsc --noEmit — zero errors baseline
pnpm knip        # unused files/exports/dependencies
pnpm format      # auto-fix formatting
```

For API tests:
```bash
pnpm --filter @spotify/api test        # unit tests
pnpm --filter @spotify/api test:int    # integration tests
```
