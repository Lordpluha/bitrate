# TypeScript conventions

Applies to all `.ts` and `.tsx` files in `apps/` and `packages/`.

## Compiler settings

**web-player**: `strict: true`, `noUncheckedIndexedAccess: true`. Array index access returns `T | undefined` — guard before use.

**API**: `strictNullChecks: true`, `noUncheckedIndexedAccess: true`. Less strict (`noImplicitAny: false`, `strictPropertyInitialization: false`) but still type-safe at boundaries.

Never weaken these settings to silence errors. Fix the code instead.

## No `any` and no suppression shortcuts

Use `unknown` for untrusted input, caught values, decoded payloads, and third-party data.
Narrow it with Zod, a type predicate, or an explicit runtime check.

- Production source does not use explicit or implicit `any`.
- `@ts-ignore` is forbidden.
- `@ts-expect-error` is limited to type-contract tests and states the rejection being tested.
- Type assertions require runtime proof; they are not a substitute for narrowing.

## Named types — no inline shapes in signatures

No anonymous `{ ... }` shapes in parameter types, return types, generic arguments, or component props:

```ts
// Bad
const findAll = (opts: { page: number; limit: number }): { data: Track[]; total: number } => { ... }

// Good
type FindAllInput = { page: number; limit: number }
type FindAllResult = { data: Track[]; total: number }
const findAll = (opts: FindAllInput): FindAllResult => { ... }
```

Naming conventions: `<Verb>Input` for parameter objects, `<Noun>` for domain shapes, `<Component>Props` for React props.

Place named types near their owner: in the same file for one consumer, in the slice/module
model for several consumers, and through the public barrel only when they are a public
contract.

String-literal unions in any signature position are also named:

```ts
// Bad
const resolve = (align: 'left' | 'center' | 'right'): string => { ... }

// Good
type ColumnAlign = 'left' | 'center' | 'right'
const resolve = (align: ColumnAlign): string => { ... }
```

Carve-outs (stay inline): `T | null`, `T | undefined`, `string | number` — TypeScript plumbing, not domain concepts.

## Function parameters — single-object pattern (web-player)

In `apps/web-player/src/`, every first-party function declares its parameters as a single destructured object with a named type:

```ts
// Bad
const setToken = (token: string, refreshToken: string): void => { ... }

// Good
type SetTokenInput = { token: string; refreshToken: string }
const setToken = ({ token, refreshToken }: SetTokenInput): void => { ... }
```

**Exceptions (keep positional):** zero-arg functions, type predicates (`(v): v is X`), variadic utilities that mirror an external contract (`cn(...classes)`), callbacks whose signature is owned by an external API (React event handlers, `useMutation`'s `onSuccess`, Next.js route handlers).

This rule applies to **web-player** code. NestJS service/controller methods use standard NestJS parameter decorators and keep positional params.

## Branded types

Brand primitive identifiers when mixing them would be dangerous:

```ts
export type TrackId = string & { readonly __brand: 'TrackId' }
export type PlaylistId = string & { readonly __brand: 'PlaylistId' }
```

Branding is optional for simple/local values and useful at domain boundaries.

## Imports

### web-player

All imports inside `apps/web-player/src/` use `@/` prefix (mapped to `./src/*`):
```ts
import { usePlayerStore } from '@/entities/Player'
import { ROUTES } from '@/shared/routes'
```

### API

All cross-module imports use path aliases:
```ts
import { PrismaService } from '@infra/prisma/prisma.service'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
```

No relative `../../` paths crossing module boundaries in either app.

Generated contracts and SVG components keep generator-owned import style. Do not hand-edit
generated files just to satisfy a source convention.

## React imports

Named imports only — never namespace access:

```ts
// Bad
import React from 'react'
const [state, setState] = React.useState(null)

// Good
import { useState } from 'react'
const [state, setState] = useState(null)
```

## async/await

Always `async/await` over raw Promise chains:

```ts
// Bad
return this.prisma.track.findMany().then(tracks => tracks.map(toEntity))

// Good
const tracks = await this.prisma.track.findMany()
return tracks.map(toEntity)
```

## Error handling

At system boundaries (HTTP calls, file I/O, external APIs), catch and handle explicitly. In NestJS services, throw typed HTTP exceptions. In Next.js, let React Error Boundaries handle rendering failures.

Never swallow errors with empty `catch {}` unless the failure is genuinely ignorable.

Web-player request errors are normalised at the shared API boundary before they become user
messages or field errors. Never expose raw fetch/Axios objects to feature/entity consumers.

## File naming

| Role | Suffix | Example |
|------|--------|---------|
| NestJS module | `<name>.module.ts` | `tracks.module.ts` |
| NestJS controller | `<name>.controller.ts` | `tracks.controller.ts` |
| NestJS service | `<name>.service.ts` | `tracks.service.ts` |
| NestJS guard | `<name>.guard.ts` | `users-auth.guard.ts` |
| Unit test | `.unit-spec.ts` (legacy `.spec.ts`) | `tracks.controller.unit-spec.ts` |
| Integration test | `.int-spec.ts` | `tracks.controller.int-spec.ts` |
| E2E test | `.e2e-spec.ts` | `tracks.e2e-spec.ts` |
| DTO | `<action>-<entity>.dto.ts` | `create-track.dto.ts` |
| NestJS entity | `<entity>.entity.ts` | `track.entity.ts` |
| Zod schema (web-player) | `<entity>.schema.ts` | `auth.schema.ts` |
| Response DTO schema | `<entity>.response.dto.ts` | `auth.response.dto.ts` |
| Shape transform adapter (web-player) | `<name>.adapter.ts` | `track.adapter.ts` |
| Formatter | `<name>.formatter.ts` | `duration.formatter.ts` |
| React component | `<ComponentName>.tsx` | `TrackCard.tsx` |
| Zustand store | `<name>Store.ts` | `playerStore.ts` |
| Hook | `use<Name>.ts` | `useAudioPlayer.ts` |
| Factory function | `create<Name>.ts` | `createQueryHook.ts` |

Runtime-validated response payloads derive their type with `z.infer` from the co-located
schema. Do not maintain a hand-written duplicate response shape.

## TSDoc style

Use `/** */` for meaningful source documentation. No `//` line comments in
`apps/web-player/src/`. Short factual description — 1–2 lines. Lean-tagged:

- `@param` / `@returns` only when the meaning isn't obvious from the name and type.
- `@throws` when the function throws intentionally — one terse line.
- `@example` only for genuinely non-obvious usage, ≤3 lines.
- No prose restating the code.
- No tracker IDs or temporary planning notes in source comments.
- Documentation lives above the declaration, not on type members or inside function bodies.
- Exceptions: short JSX section markers and a terse marker required for a lint-safe
  intentionally empty block.

```ts
/** Streams audio content for the given track, honoring Range headers. */
stream(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request, @Res() res: Response) { ... }
```

## Vertical whitespace

Separate every **top-level declaration** with exactly one blank line. Adjacent top-level declarations never sit on consecutive lines.

Import blocks and barrel re-export blocks stay packed (no blank lines between their members). A blank line separates each group from surrounding declarations.

```ts
// Bad — packed declarations
export const loginSchema = z.object({ email: z.string() })
export type LoginValues = z.infer<typeof loginSchema>
export const registerSchema = z.object({ email: z.string(), password: z.string() })

// Good — one blank line between each
export const loginSchema = z.object({ email: z.string() })

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({ email: z.string(), password: z.string() })
```

## Test placement

| Surface | Kind | Location |
|---|---|---|
| API | unit/integration | Co-located under `apps/api/src/` |
| API | E2E | `apps/api/test/e2e/` |
| ui-react | unit/int/snapshot/screenshot | Co-located with the component |
| tokens-generator | node:test integration | Package test tree |

Do not create web-player Vitest or Playwright specs until the app owns runner configuration
and scripts.

## File size

- `.tsx` components follow the hard 100-logic-line rule in `code-principles.md`.
- Non-component `.ts` files should stay around 100 logic lines; over 150 total lines is a
  mandatory review signal.
- Split by responsibility, not arbitrary line chunks.

## Constants — no magic values

- HTTP paths: use `ROUTES` from `@/shared/routes` (web-player)
- Env vars: access via validated config, not raw `process.env` inside modules (API)
- Repeated string/number literals → extract to a named constant
