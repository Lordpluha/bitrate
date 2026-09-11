# Admin rules — apps/admin (Angular 22, operator panel)

Read before writing any file in `apps/admin/`. Pair with the `angular` framework docs; this file
is project law. The decision behind the stack is [ADR-0035](../../apps/docs/docs/architecture/0035-admin-panel-on-angular.md).

An earlier file with this name described the Kottster panel and was deleted with it
([ADR-0025](../../apps/docs/docs/architecture/0025-remove-admin-panel.md)). Nothing in this one
carries over from it.

## What this app is

The operator surface: catalog, artists, users, moderation. Internal, staff-only, behind
authentication, never linked publicly. Its needs are throughput and correctness, not persuasion.

It is a **SPA** — no `@angular/ssr`, no server rendering. Everything is behind a login, so there
is nothing to render for a crawler.

It is **zoneless**. `zone.js` is not a dependency and must not become one. Do not add
`provideZoneChangeDetection`.

## What does NOT apply here

Almost the whole web-frontend rulebook is React-shaped and does not transfer. These are not gaps
to fill — they are concepts that do not exist in this app:

| Web rule | Status in `apps/admin` |
|---|---|
| FSD layers (`views/`, `widgets/`, `entities/`) | Not used — `features/` + `shared/` only |
| `'use client'` / Server Components | No server component model |
| `@bitrate/ui-react` components | **Will not run** — React library |
| `@bitrate/contracts` | **Used** for types — see "Schemas" below |
| TanStack Query / `openapi-fetch` | Not used — see "Data" below |
| Biome | This app uses ESLint + Prettier |
| `<div>` with `onClick` | Angular templates, `(click)` on a real `<button>` |

Rules that **do** apply: `.claude/rules/typescript.md` (named types, no production `any`, no
suppression shortcuts), `.claude/rules/code-principles.md` (SOLID/DRY/KISS, the size and props
limits), and the accessibility contract in `apps/docs/docs/brand/a11y.md`.

## Structure

```
apps/admin/
  src/app/
    features/<name>/   one folder per screen: <name>.ts + <name>.html
    shared/
      api/             services, interceptor, schemas/
      forms/           zodValidator bridge
      lib/             cn() and other pure helpers
    app.ts             shell: sidebar + router-outlet
    app.routes.ts      lazy routes, guards
    app.config.ts      providers
```

Path aliases: `@app/*`, `@shared/*`, `@features/*`. No relative imports across those boundaries.

**File naming is Angular's**, not the repo's React convention: `moderation.ts`, `auth.service.ts`,
`zod-validator.ts` — kebab-case, no PascalCase component files. Match what is already there.

## API side: the guard is a floor on the class, never a per-method opt-in

Every controller under `apps/api/src/modules/admin/` declares `@AdminAuth('ADMIN', 'MODERATOR')`
**on the class**, between `@ApiTags` and `@Controller`. A route that needs less declares
`@StaffRoles('ADMIN')` on the method.

The reason is what each mistake costs. With the guard per method, a new handler someone forgets
to decorate is a **completely unauthenticated operator endpoint** — it compiles, it lints, it
type-checks, and the integration specs stub the guard with a role check that waves through any
route carrying no role metadata. With the guard on the class, the same slip yields a route that
is merely open to both staff roles. One is a breach; the other is a review comment.

`StaffRoles` carries the role metadata and the 403 response, and deliberately not
`ApiCookieAuth`. Both halves of that were learned the hard way, and both are invisible until the
contract is regenerated:

- Using `AdminAuth` twice on one route applies `ApiCookieAuth` twice, and the spec then lists the
  same requirement twice — `security: [{ cookie: [] }, { cookie: [] }]`.
- Leaving the 403 to the class does **not** work, because a method-level `ApiResponse` *replaces*
  the class's for that status rather than merging. Omitting it rewrote the generated description
  of every narrowed route from `Requires the ADMIN role / Insufficient staff role` down to the
  first line alone — 16 lines of contract drift that only the `Verify generated API contracts` CI
  step catches.

So check the generated spec, not just the guard's behaviour: `security`, response codes **and
their descriptions**. With the current split, `DELETE /admin/users/{id}` generates
`security=[{"cookie":[]}]`, responses `200,401,403,404`, and the 403 description
`"Requires the ADMIN role\n\nInsufficient staff role"` — identical to the per-method form, so
this costs no contract regeneration.

`apps/api/src/modules/admin/admin-auth-coverage.unit-spec.ts` enforces all of it. It discovers
controllers on disk rather than through `AdminModule`, so a controller that exists is covered
whether or not anyone remembered to register it, and it names the public routes explicitly —
today only `AdminAuthController.login`, because that is how a session starts. Adding to that set
is a line in a diff, which is the point.

## Data — no cache, on purpose

`HttpClient` with `provideHttpClient(withFetch())`. Reads go through `httpResource` or a service
method; there is **no query cache** in this app, by decision. Two components reading one endpoint
issue two requests, and a mutation is followed by an explicit reload. Do not introduce TanStack
Query or a hand-rolled cache without a new ADR.

Auth is httpOnly cookies with a refresh-on-401 interceptor (`shared/api/auth.interceptor.ts`),
mirroring what the artists portal does. Nothing reads or writes a token in JavaScript.

## Schemas — zod at runtime, the generated contract for types

Every response is `parse`d in the service before it reaches a component, and every schema in
`shared/api/schemas/` is bound to the generated contract:

```ts
type ContractArtist = Pick<ApiSchemas['AdminArtistEntity'], 'id' | 'username' | …>

export const adminArtistSchema = z.object({ … }) satisfies z.ZodType<ContractArtist>
```

Naming the slice as a `Pick` rather than mirroring the whole entity keeps the schema honest about
what the UI actually reads, while a renamed or retyped field in the contract becomes a compile
error here. `z.infer` stays the source of the exported type, so nothing downstream changes shape.

This replaced fully hand-written schemas, which drifted exactly as predicted: the catalog page
required `artistName` while the API had always sent `artistUsername`, so `parse` threw on every
list load and the column rendered its em-dash fallback. `AdminAuditLogEntity.actorUsername` had
already been caught the same way, by hand.

**`satisfies` does not catch a narrower union.** A zod enum missing a member the contract declares
is still assignable, so a status the API grows later type-checks cleanly and then throws inside
`parse` — an empty screen in front of an operator. Build those lists with `contractEnum` /
`coveringTuple` from `schemas/contract-union.ts`, which state the union and force the list to
cover it. That applies to display-order lists in components too, not just schemas.

Page envelopes are bound through the item type, because `Pick[]` is not assignable to the full
entity array:

```ts
type ContractArtistPage = Omit<ApiSchemas['PaginatedAdminArtistsEntity'], 'data'> & {
  data: ContractArtist[]
}
```

`@bitrate/contracts` is a **devDependency** here: it ships types only, erased at build, like
`@bitrate/ui-react` whose CSS is consumed at build time and whose components never run.

`zod` is pinned repo-wide (see `.claude/rules/monorepo.md`). Do not raise it here.

## Forms — Reactive Forms plus the zod bridge

Angular Reactive Forms is the form engine. The schema stays the source of truth through
`zodValidator` (`shared/forms/zod-validator.ts`), attached to the **`FormGroup`**, never to
individual controls — cross-field rules can only be evaluated against the whole value.

Errors are read back with `zodErrorMessage(control)`. Bind `aria-invalid` and `aria-describedby`,
and give the message element `role="alert"`.

Signal Forms (`@angular/forms/signals`) exist in Angular 22 and are not used here. Angular's own
guidance is that reactive forms remain the choice where production stability matters.

## Styling

Tailwind v4 through `@tailwindcss/postcss`, with `@bitrate/ui-react/themes.css` imported in
`src/styles.css` as the token source. That package is a **devDependency**: its CSS is consumed at
build time, its components never at runtime.

Token-backed utilities only — `bg-primary`, `text-muted-foreground`, `border-border`. No hex
literals, no Tailwind stock colour scales (`slate`, `gray`, `zinc`…): they lint clean but the
theme switch cannot reach them. `cn()` lives in `shared/lib/cn.ts` and has the same contract as
its React twin.

## Linting

**ESLint, not Biome** — this and `apps/mobile` are the two exceptions in the monorepo. Biome
cannot parse Angular template semantics, and ESLint is the only linter that accepts a third-party
parser. Config: `angular-eslint` (`ts-recommended` + `template-recommended` +
`template-accessibility`) with `eslint-config-prettier` last. Formatting is Prettier's job.

Two rules are deliberately overridden, both documented in `eslint.config.js`:
`consistent-type-definitions` is off because the repo writes named shapes as `type`; and
`template/no-call-expression` is off because it cannot tell a signal read from an expensive call
and flagged every one.

## Testing

Vitest through `@angular/build:unit-test`. Specs are `*.unit-spec.ts` — the repo suffix, wired
into both `tsconfig.spec.json` and the builder's `include`, not Angular's default `*.spec.ts`.

A spec that only covers the happy path is not finished. Whatever can realistically fail gets a
case: a rejected mutation, a schema mismatch, a failed guard, an empty list.

## Commands

```bash
pnpm --filter @bitrate/admin dev            # ng serve on :3005
pnpm --filter @bitrate/admin build
pnpm --filter @bitrate/admin lint           # eslint
pnpm --filter @bitrate/admin check-types
pnpm --filter @bitrate/admin test
```

**Node ≥ 22.22.3 is required by the Angular CLI**, above the repo's own `engines: >=24` floor only
in the sense that 24 satisfies both. A Node 20 shell fails with a version error before anything
builds.

## Related

- [ADR-0035](../../apps/docs/docs/architecture/0035-admin-panel-on-angular.md) — the stack decision and what it costs.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`, `.claude/rules/code-style.md`.
- `apps/docs/docs/brand/a11y.md` — the accessibility contract.
