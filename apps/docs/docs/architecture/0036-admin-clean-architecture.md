# ADR-0036: The operator panel is layered as clean architecture

Status: Accepted

Date: 2026-09-14

## Context

[ADR-0035](./0035-admin-panel-on-angular.md) settled the stack for `apps/admin` and left the file
layout at Angular's default: `features/<screen>` for components and `shared/api` for everything
else. That shape held while the panel was five screens, and it was already leaking:

- **`shared/api` was the whole application.** Six `@Injectable` services each built their own URL,
  issued their own request, ran their own `parse`, and handed the raw transport object to a
  component. There was no layer between "the API said this" and "the screen shows that", so the
  API's vocabulary reached the templates directly — `artist.deletedAt` was rendered next to a
  button labelled **Deactivate**.
- **Business rules lived in components.** `STUCK_AFTER_MS`, the heuristic that decides whether a
  track has been processing too long, was a constant in `catalog.ts`. Nothing else could reach it,
  nothing tested it, and a second screen needing the same rule would have copied it.
- **Nothing could be tested without HTTP.** A component's only seam was `HttpClient`, so a test of
  "an already-deactivated artist cannot be deactivated again" had to go through a mocked transport
  to assert a rule that has nothing to do with transport.
- **The generated contract reached everywhere.** `@bitrate/contracts` types were imported by the
  schema files, which were imported by the services, which were imported by the components. The
  binding is valuable — it is what caught the `artistUsername` drift — but it had no boundary.

## Decision

`apps/admin/src/app` is four layers, and the dependency rule points inward only:

```
presentation ─┐
              ├──> application ──> domain <── infrastructure
app.config ───┘
```

| Layer | Holds | May import |
|---|---|---|
| `domain/` | Entities, filters, policies, repository **ports** | nothing |
| `application/` | One class per use case, plus `SessionStore` | `domain/`, `@angular/core` |
| `infrastructure/` | HTTP adapters, zod DTOs bound to the contract, mappers | `domain/`, Angular HTTP, zod, `@bitrate/contracts` |
| `presentation/` | Components, templates, guards, the form bridge, `createCollection` | `application/`, `domain/` |

Four decisions inside that are not obvious:

**Ports are abstract classes, not `InjectionToken`s.** An `InjectionToken` would drag
`@angular/core` into `domain/`, which is the one layer that must depend on nothing. An abstract
class is simultaneously the compile-time type and a runtime DI token, so
`{ provide: ArtistRepository, useClass: HttpArtistRepository }` works with a domain that has never
heard of Angular.

**The domain declares its own unions instead of importing the contract's.** `TrackProcessingStatus`,
`ModerationStatus` and `StaffRole` are written out in `domain/`, and each mapper joins them to the
contract's union through a record:

```ts
const TO_DOMAIN_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<WireProcessingStatus, TrackProcessingStatus>
```

This keeps the guarantee `contractEnum` was written for — a status the API grows later is a
compile error — while moving the failure from a zod `parse` at runtime to a line in a mapper at
build time. `satisfies` on a zod enum alone never gave that; a narrower enum is still assignable,
which is exactly how a new API member used to reach an operator as an empty screen.

**Mappers are the anti-corruption layer, and they are allowed to rename.** ISO strings become
`Date`s once, at the boundary, so no policy has to call `new Date()` on a field it was handed. The
API's `deletedAt` becomes `deactivatedAt`, because deactivating is what the panel does and nothing
is deleted. One file knows both names.

**The dependency rule is enforced by ESLint, not by discipline.** Four
`@typescript-eslint/no-restricted-imports` blocks in `eslint.config.js`, one per layer, each
listing both the path alias and a `**/<layer>/**` pattern so a relative path cannot slip past.
Verified by writing a violating file, running `eslint` on it, and confirming it was reported —
the same proof `.claude/rules/code-style.md` demands of the Biome nursery rules, and for the same
reason: a boundary rule that silently matches nothing is worse than no rule, because it reads like
protection.

## Consequences

- **A rule has one home and a test.** `isTrackStuck`, `canReprocess`, `canAdvanceTo` and
  `isArtistActive` are pure functions over domain types, tested without a `TestBed` or a mocked
  `HttpClient`. The suite went from 42 to 65 cases, and the new ones are mostly negative paths.
- **A use case can be tested against a stub port.** `DeactivateArtistUseCase` refusing an already
  deactivated account is asserted with a five-line stub class, not an HTTP mock.
- **Swapping an adapter is one line.** `infrastructure.providers.ts` is the only file that names
  both a port and its implementation.
- **`AdvanceReportUseCase` short-circuits a no-op transition.** Clicking **Resolve** on a report
  that is already `RESOLVED` no longer issues a request, so it no longer writes an audit entry
  saying nothing changed. That is the one behaviour change in the migration.
- **The cost is indirection.** Listing artists now passes through a use case, a port, an adapter
  and a mapper where it used to be one service method. For a five-screen panel that is real
  overhead, accepted because the panel is the surface that grows — moderation tooling, bulk
  actions and reporting are all on the roadmap, and each is a rule rather than a screen.
- **A new screen has a fixed shape.** Domain model plus port, use case, DTO plus mapper plus
  adapter, page. Longer than it was; the same every time.
- **`apps/admin` is now the only app in the monorepo on this pattern.** It does not transfer to the
  web player (FSD) or the artists portal, and no one should port it there on the strength of this
  ADR alone.

## Alternatives considered

- **Leave the service layer and only extract the policies.** Cheapest, and it would have fixed the
  `STUCK_AFTER_MS` complaint. Rejected because it fixes the symptom: the services would still hand
  transport objects to components, so the contract's vocabulary would keep reaching templates and
  the next rule would land in a component again for lack of anywhere better.
- **Adopt FSD, matching `apps/web-player`.** One pattern across the frontends is worth something.
  Rejected because FSD organises by *feature slice* and this panel's difficulty is not slicing —
  it is that the rules and the transport were the same objects. FSD has no opinion about that, and
  its layer vocabulary (`widgets`, `entities`, `views`) does not describe an Angular SPA.
- **Ports as `InjectionToken`s in `application/`, leaving `domain/` type-only.** Works, and it is
  what most Angular clean-architecture write-ups do. Rejected because it puts the interface a level
  away from the entity it serves, and the abstract class costs nothing to get both.
- **Keep zod schemas as the domain types (`z.infer` everywhere).** That is what the app did.
  Rejected because it makes every domain type depend on zod and on the generated contract behind
  it, which is the coupling this ADR exists to cut.
