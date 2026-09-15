# Admin rules — apps/admin (Angular 22, operator panel)

Read before writing any file in `apps/admin/`. Pair with the `angular` framework docs; this file
is project law. The decision behind the stack is [ADR-0035](../../apps/docs/docs/architecture/0035-admin-panel-on-angular.md);
the decision behind its layering is [ADR-0036](../../apps/docs/docs/architecture/0036-admin-clean-architecture.md).

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
| FSD layers (`views/`, `widgets/`, `entities/`) | Not used — clean architecture instead, see "Layers" |
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
    domain/<concept>/       entity + filters + policies + the repository port
    application/<area>/     one class per use case; session/ also holds SessionStore
    infrastructure/
      http/                 api.config, the interceptor, fetchPage, contractEnum
      <area>/               zod DTO + mapper + the HTTP adapter for one port
      infrastructure.providers.ts   binds every port to its adapter
    presentation/
      pages/<screen>/       <screen>.ts + <screen>.html
      components/           CollectionStatus, Paginator
      navigation/           sidebar
      forms/                zodValidator bridge
      guards/               requireStaffSession
      state/                createCollection
      ui/                   vendored spartan-ng source
    app.ts                  shell: sidebar + router-outlet
    app.routes.ts           lazy routes, guards
    app.config.ts           the composition root
```

Path aliases: `@app/*`, `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`
(plus bare `@domain`, `@application`, `@infrastructure` for the top barrels). No relative imports
across those boundaries.

**File naming is Angular's**, not the repo's React convention: `moderation.ts`,
`list-artists.use-case.ts`, `http-artist.repository.ts`, `zod-validator.ts` — kebab-case, no
PascalCase component files. Match what is already there.

## Layers — the dependency rule points inward, and ESLint enforces it

Four layers. An arrow only ever goes toward `domain/`.

| Layer | Holds | May import |
|---|---|---|
| `domain/` | Entities, filters, policies, repository **ports** | **nothing** |
| `application/` | One class per use case, plus `SessionStore` | `domain/`, `@angular/core` |
| `infrastructure/` | HTTP adapters, zod DTOs bound to the contract, mappers | `domain/`, Angular HTTP, zod, `@bitrate/contracts` |
| `presentation/` | Components, templates, guards, the form bridge, `createCollection` | `application/`, `domain/` |

`app.config.ts` and `infrastructure.providers.ts` are the composition root and are the only files
allowed to see both a port and its adapter.

Four rules that are easy to get wrong:

- **A port is an `abstract class`, never an `InjectionToken`.** The token would drag
  `@angular/core` into `domain/`. An abstract class is both the type and the DI token, so
  `{ provide: ArtistRepository, useClass: HttpArtistRepository }` works against a domain that has
  never heard of Angular. An adapter is `@Injectable()` *without* `providedIn` and `extends` the
  port, marking every method `override`.
- **A component never touches a repository.** It injects use cases. If a screen needs something no
  use case offers, add the use case — do not reach past it.
- **Nothing transport-shaped leaves `infrastructure/`.** The mapper converts ISO strings to `Date`
  and renames wire fields that lie (`deletedAt` → `deactivatedAt`, because the panel deactivates
  and deletes nothing). A component that writes `new Date(x)` on an API field is a layering bug.
- **A rule belongs in `domain/`, as a pure function over domain types.** `isTrackStuck`,
  `canReprocess`, `canAdvanceTo`, `isArtistActive`. A constant like `STUCK_AFTER_MS` living in a
  component is the smell this layering exists to remove.

The boundaries are four `@typescript-eslint/no-restricted-imports` blocks in `eslint.config.js`,
one per layer, each listing the path alias **and** a `**/<layer>/**` pattern so a relative path
cannot slip past. If you change them, prove they still fire the way
`.claude/rules/code-style.md` demands of the Biome nursery rules: write a file that violates the
boundary, run `npx eslint` on it, confirm it is reported, then delete it. A boundary rule that
silently matches nothing is worse than no rule, because it reads like protection.

## Adding a screen

Same shape every time, inward first:

1. `domain/<concept>/` — the entity, its filter type, any policy, and the port.
2. `application/<area>/` — a use case per operator intent, injecting the port.
3. `infrastructure/<area>/` — the zod DTO bound to `ApiSchemas` via `Pick` + `satisfies`, a mapper,
   and the adapter; register it in `infrastructure.providers.ts`.
4. `presentation/pages/<screen>/` — the component and template, injecting use cases and driving a
   `createCollection`.
5. A lazy route in `app.routes.ts` with `canActivate: [requireStaffSession]`.

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

`HttpClient` with `provideHttpClient(withFetch())`. Reads go page → use case → port → HTTP
adapter; there is **no query cache** in this app, by decision. Two components reading one endpoint
issue two requests, and a mutation is followed by an explicit reload. Do not introduce TanStack
Query or a hand-rolled cache without a new ADR.

Auth is httpOnly cookies with a refresh-on-401 interceptor (`infrastructure/http/auth.interceptor.ts`),
mirroring what the artists portal does. Nothing reads or writes a token in JavaScript.

## Schemas — zod at runtime, the generated contract for types

Every response is `parse`d in the adapter before its mapper turns it into a domain object, and
every DTO in `infrastructure/<area>/` is bound to the generated contract:

```ts
type ContractArtist = Pick<ApiSchemas['AdminArtistEntity'], 'id' | 'username' | …>

export const artistDto = z.object({ … }) satisfies z.ZodType<ContractArtist>
```

Naming the slice as a `Pick` rather than mirroring the whole entity keeps the DTO honest about
what the UI actually reads, while a renamed or retyped field in the contract becomes a compile
error here. `z.infer` stays the source of the DTO type; the *domain* type is written by hand and
the mapper joins the two, which is what lets a wire field be renamed on the way in.

This replaced fully hand-written schemas, which drifted exactly as predicted: the catalog page
required `artistName` while the API had always sent `artistUsername`, so `parse` threw on every
list load and the column rendered its em-dash fallback. `AdminAuditLogEntity.actorUsername` had
already been caught the same way, by hand.

**`satisfies` does not catch a narrower union.** A zod enum missing a member the contract declares
is still assignable, so a status the API grows later type-checks cleanly and then throws inside
`parse` — an empty screen in front of an operator. Build a zod enum with `contractEnum` from
`infrastructure/http/contract-union.ts`, and any plain display list — a filter strip's buttons,
say — with `coveringTuple` from `domain/shared/`. Both state the union and force the list to
cover it, so this applies to component-level lists as much as to schemas.

A union the **domain** declares is bound to the contract a third way: an exhaustive
`satisfies Record<WireX, DomainX>` in that area's mapper. That is what makes it safe for
`TrackProcessingStatus`, `ModerationStatus` and `StaffRole` to be written out in `domain/`
instead of imported — a member the API grows later is a compile error at one record rather than
a `parse` failure in front of an operator.

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
`zodValidator` (`presentation/forms/zod-validator.ts`), attached to the **`FormGroup`**, never to
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
theme switch cannot reach them. The class-merge helper here is `hlm()` from
`@spartan-ng/helm/utils` (vendored under `presentation/ui/utils/`), not a `cn()` of this app's
own — it wraps `clsx` + `tailwind-merge` exactly like its React twin.

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
- [ADR-0036](../../apps/docs/docs/architecture/0036-admin-clean-architecture.md) — the layering and why ports are abstract classes.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`, `.claude/rules/code-style.md`.
- `apps/docs/docs/brand/a11y.md` — the accessibility contract.
