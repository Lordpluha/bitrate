---
name: admin-rules
description: Angular 22 operator panel rules for apps/admin — clean-architecture layering (domain/application/infrastructure/presentation), Spartan/Angular conventions, and what does not carry over from the web player. Use whenever writing or reviewing any file under apps/admin/.
globs:
  - "apps/admin/**"
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

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
      pages/<screen>/       <screen>.ts + <screen>.html + <screen>.query.ts
      components/           CollectionStatus, Paginator, PermissionGrid, SortHeader
      navigation/           sidebar
      forms/                zodValidator bridge
      guards/               requireStaffSession, requirePermission
      state/                createCollection, bindQueryState, query codecs
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
boundary, run `pnpm --filter @bitrate/admin exec eslint` on it, confirm it is reported, then delete it. A boundary rule that
silently matches nothing is worse than no rule, because it reads like protection.

## Adding a screen

Same shape every time, inward first:

1. `domain/<concept>/` — the entity, its filter type, any policy, and the port.
2. `application/<area>/` — a use case per operator intent, injecting the port.
3. `infrastructure/<area>/` — the zod DTO bound to `ApiSchemas` via `Pick` + `satisfies`, a mapper,
   and the adapter; register it in `infrastructure.providers.ts`.
4. `presentation/pages/<screen>/` — the component and template, injecting use cases and driving a
   `createCollection`.
5. A lazy route in `app.routes.ts` with
   `canActivate: [requireStaffSession, requirePermission('<resource>:read')]`, the path added to
   `ROUTE_PERMISSIONS`, and a sidebar item carrying the same permission. A path like `<screen>/new`
   is declared **before** `<screen>/:id`, or `new` is captured as an id.

**Guards in one `canActivate` array run concurrently.** Angular invokes every guard at once and only
prioritises their results in array order, so a guard can never assume an earlier one has finished.
`requirePermission` reads `SessionStore`, which `requireStaffSession` fills asynchronously from
`/me`; when it read the store synchronously, every operator — administrators included — landed on
the no-access page after every refresh. It now restores the session itself, and concurrent restores
share one `/me` request. A spec that seeds the store before activating a guard cannot catch this;
test guard composition with an empty store and a repository that resolves on a later turn.

Hiding a control with `SessionStore.can()` is cosmetic. The API enforces every request.

## API side: a session floor on the class, a permission on every route

Authorisation is by **permission**, not role — see
[ADR-0038](../../apps/docs/docs/architecture/0038-operator-permissions-roles-as-templates.md).
Permissions live on the operator (`Staff.permissions`); a role is only a template copied at
assignment and guarantees nothing at request time.

Every controller under `apps/api/src/modules/admin/` declares `@AdminAuth()` **on the class**,
between `@ApiTags` and `@Controller`, with no arguments. Every route declares
`@RequirePermission('<resource>:<action>')` from the catalogue in
`apps/api/src/modules/admin-auth/access/permissions.ts`.

The floor stays on the class for what each mistake costs. With the guard per method, a handler
someone forgets to decorate is a **completely unauthenticated operator endpoint** — it compiles,
lints and type-checks. With the guard on the class, the same slip yields a route open to any staff
session. One is a breach; the other is a review comment — and the coverage spec below turns it into a
failing test.

`@RequirePermission` carries the permission metadata and a 403 response naming the permission, and
deliberately not `ApiCookieAuth`. Three lessons, all invisible until the contract is regenerated:

- **`ApiCookieAuth` applied twice** — once from the class decorator and once from a method decorator
  — lists the same requirement twice in the generated spec: `security: [{ cookie: [] }, { cookie: [] }]`.
- **A method-level `ApiResponse` replaces the class's for that status** rather than merging. Leaving
  a status to the class rewrote the generated description of every narrowed route; only the
  `Verify generated API contracts` CI step caught the drift.
- **Declare `ApiBody({ type: XDto })` explicitly on every write route.** Controllers import DTOs as
  types, which erases them; without an explicit `ApiBody`, Swagger reads the body type from
  decorator metadata, finds `Function`, and the contract types the body as `Record<string, never>`.
  Five role and staff routes shipped that way before being fixed, and the panel had to hand-write
  unbound request DTOs against them.

`apps/api/src/modules/admin/admin-auth-coverage.unit-spec.ts` enforces the floor and the permissions.
It discovers controllers on disk rather than through `AdminModule`, so a controller that exists is
covered whether or not anyone registered it. It names the public routes (`AdminAuthController.login`)
and the session-only routes (`getMe`, `logout`, `refresh`) explicitly, and pins every other route to
its permission in a table. Changing a route's permission is therefore a visible line in a diff, and
removing one fails the spec.

Two rules about stored permissions: they are **added and deprecated, never renamed**, because a
rename is a data migration on every operator's array; and `staff:*` / `roles:*` are protected,
grantable to no one, and rejected by `assertGrantable` in both the role-template and the
per-operator write path.

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
`TrackProcessingStatus`, `ModerationStatus` and `Permission` to be written out in `domain/`
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

## List state lives in the URL

A list screen's filters, page and sort are in its query string, and **the URL is the single source of
truth**. An action calls `patch(...)` from `bindQueryState` (`presentation/state/query-state.ts`),
which navigates; an effect decodes the resulting `queryParamMap` and loads. Nothing in the load path
writes the URL, so there is no feedback loop to guard. The decoded state signal compares by its
*serialised* form, so a navigation that produces the same canonical query string never reloads.

Each screen owns a `<screen>.query.ts` with its codec (`presentation/state/query-codec.ts`):

- **Defaults are omitted.** An untouched screen has a clean URL, and `page` is dropped at 1.
  Moderation is the exception: its default status is `OPEN`, so "all" is the explicit `status=all`.
- **Garbage decodes to the default.** A hand-edited `?page=abc`, an unknown status, or a sort field
  outside the endpoint's allowlist decodes as though it were absent. A sort is decoded from `sort` and
  `dir` together, so `dir` alone is no sort. Nothing outside an allowlist ever reaches the API, which
  would answer with a 400 and an error on screen.
- **History follows intent.** A discrete change — a filter button, a page, a sort — adds a history
  entry. Typing in a search box uses `replaceUrl`, debounced, so keystrokes do not fill history.
- **A filter or sort change resets `page` to 1 in the same `patch`.** One navigation, one load.

`createCollection` discards a response from a superseded request, so an older answer cannot overwrite
a newer one under rapid navigation, and `show(page)` loads a deep-linked page before the page count is
known.

Sort-field unions are written in `domain/` and bound in the mapper to the **operation's query
parameter** type from the contract, so a field the API drops is a compile error. The catalog's
unsorted order puts tracks needing attention first, and says so on screen; choosing a sort replaces
that order and clearing it restores it.

## Forms — Reactive Forms plus the zod bridge

Angular Reactive Forms is the form engine. The schema stays the source of truth through
`zodValidator` (`presentation/forms/zod-validator.ts`), attached to the **`FormGroup`**, never to
individual controls — cross-field rules can only be evaluated against the whole value.

Errors are read back with `zodErrorMessage(control)`. Bind `aria-invalid` and `aria-describedby`,
and give the message element `role="alert"`.

Signal Forms (`@angular/forms/signals`) exist in Angular 22 and are not used here. Angular's own
guidance is that reactive forms remain the choice where production stability matters.

## Configuration — `.env`, through a generated module

Angular has **no `.env` support**: `@angular/build` never reads one, and `angular.json` is static
JSON that does not interpolate environment variables. The bridge is
`apps/admin/scripts/with-env.mjs`, which every package script runs first. It validates the
environment and writes `src/app/infrastructure/http/env.generated.ts` — gitignored, imported by
`api.config.ts`.

The script checks **`.env.local` first, then `.env`**, and never overwrites a variable that is
already set (`scripts/load-env-files.mjs`, parsed with Node's own `util.parseEnv`). So a real shell
variable beats both files, and `.env.local` beats `.env`.

The order lives in the script, not in `node --env-file-if-exists` flags, on purpose: Node lets the
*last* flag win, so listing the files in priority order as flags would silently invert it. If you move
loading back to flags, list them in reverse priority — and prefer not to.

**`apps/api` has the opposite file priority.** Its `ConfigModule` lists
`envFilePath: ['.env', '.env.local', …]` and lets the *first* entry win, so there `.env` overrides
`.env.local` — a value set only in `.env.local` is ignored whenever `.env` also defines it. Do not
assume either app's order applies to the other.

| Variable | Needed by | Notes |
|---|---|---|
| `NG_APP_API_URL` | every script | Baked into the bundle at build time |
| `ADMIN_PORT` | `dev`, `start` | Passed to `ng serve --port` |

Three rules that are easy to get wrong:

- **The generator has no fallback, deliberately.** A missing variable fails the script naming it,
  rather than silently producing a bundle that points at `localhost`. That is why CI passes
  `NG_APP_API_URL` as step-level `env:` on lint, typecheck and test, and why the Dockerfile's
  `ARG NG_APP_API_URL` carries no default.
- **`define` is not the mechanism any more, and must not come back.** The `unit-test` builder has
  no `define` option — it inherits one from the `build` target — so a value configured for `build`
  alone leaves specs with nothing. A generated module reaches build, serve, test and typecheck
  identically.
- **This is build-time configuration.** The value is inlined into the bundle exactly as
  `next build` inlines `NEXT_PUBLIC_*`; setting it on a running container does nothing. Moving to
  runtime configuration (a fetched `config.json`) is a real change with an entrypoint and an extra
  request — it needs an ADR, not a quiet edit.

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

**The builder shares one `TestBed` across spec files.** A spec that configures `TestBed` after another
has instantiated it throws, so call `TestBed.resetTestingModule()` before `configureTestingModule`.
With `RouterTestingHarness`, `Location.back()` has no real history to replay; assert the navigation
options you pass (`replaceUrl`) rather than emulating the back button.

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
- [ADR-0038](../../apps/docs/docs/architecture/0038-operator-permissions-roles-as-templates.md) — operators hold permissions; roles are templates.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`, `.claude/rules/code-style.md`.
- `apps/docs/docs/brand/a11y.md` — the accessibility contract.
