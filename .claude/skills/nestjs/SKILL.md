---
name: nestjs
description: NestJS framework conventions for apps/api — dependency injection and provider scope, module wiring and circular imports, the guard/interceptor/pipe/filter execution order, lifecycle hooks, and testing seams. Use when adding or changing a NestJS module, provider, guard, interceptor, pipe, or exception filter, or when a provider fails to resolve. For module folder layout and the Swagger-decorator rule, read .claude/rules/api-rules.md first — this skill covers framework mechanics that rule does not.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# NestJS — framework mechanics

`.claude/rules/api-rules.md` owns the **structure** (module anatomy, thin controllers,
`decorators/`, DTOs, entities, errors). This skill covers the **framework behaviour** that
rule assumes you already know. Read the rule first; come here when something does not
resolve, fires in the wrong order, or needs a testing seam.

## Dependency injection

Providers are singletons per module by default. Constructor injection only — `new Service()`
bypasses the container and gets you an instance with `undefined` dependencies.

```ts
@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
  ) {}
}
```

**A provider is only injectable where it is visible.** Visibility comes from the module
graph, not from the import path:

- `providers: [X]` — X is usable *inside this module*.
- `exports: [X]` — other modules that `imports:` this module can use X.
- Importing the class in TypeScript does nothing for DI.

`Nest can't resolve dependencies of the X (?)` means the `?` position is not exported by any
imported module. Fix the module graph; do not paper over it with `@Optional()`.

### Circular imports

Two modules importing each other is usually a design smell — extract the shared piece into a
third module. When it is genuinely necessary, both sides need the forward ref:

```ts
@Module({ imports: [forwardRef(() => TracksModule)] })
// and at the injection site:
constructor(@Inject(forwardRef(() => TracksService)) private tracks: TracksService) {}
```

### Global modules

`@Global()` makes a module's exports available everywhere without importing it. Use it
sparingly — it hides the dependency graph. `PrismaService`, config, and cache are the
legitimate cases; a domain service is not.

## Execution order — the thing that surprises people

For a single request, Nest runs:

```
middleware → guards → interceptors (before) → pipes → handler
           → interceptors (after) → exception filters
```

Consequences worth knowing before you debug for an hour:

- **Guards run before pipes.** A guard cannot read a validated/transformed body — validation
  has not happened yet. Guards see raw request data.
- **Pipes run per-parameter**, immediately before the handler. `ParseUUIDPipe` on one param
  does not validate another.
- **Interceptors wrap the handler on both sides**, so they are where response shaping,
  timing, and caching belong — not in the controller.
- **Exception filters catch everything downstream of them**, including errors thrown in
  pipes and interceptors, but *not* errors thrown in middleware.

Binding scope, narrowest first: parameter → handler → controller → module → global
(`app.useGlobalX()` in `main.ts`).

## Guards

```ts
@Injectable()
export class UserAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<UserAuthRequest>()
    return !!req.user
  }
}
```

Return `false` → 403. Throw a specific exception when the caller deserves a better message.
Wrap the guard in a decorator (`@UserAuth()` → `@UseGuards(UserAuthGuard)`) so call sites
read as intent, not plumbing.

Reading route metadata (roles, public routes) uses `Reflector`:

```ts
const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
  ctx.getHandler(), ctx.getClass(),
])
```

`getAllAndOverride` lets a handler override its controller — that is almost always what you
want over `get`.

## Lifecycle hooks

`onModuleInit` → `onApplicationBootstrap` → (running) → `onModuleDestroy` →
`beforeApplicationShutdown` → `onApplicationShutdown`.

Open connections in `onModuleInit`, close them in `onModuleDestroy`. Shutdown hooks only
fire if `app.enableShutdownHooks()` is on — without it, a container SIGTERM kills in-flight
work.

## Testing seams

Unit — mock the dependencies, no HTTP:

```ts
const prisma = mockDeep<PrismaService>()
const module = await Test.createTestingModule({
  providers: [TracksService, { provide: PrismaService, useValue: prisma }],
}).compile()
```

Integration — real HTTP through supertest, mocked services, guards overridden:

```ts
const module = await Test.createTestingModule({ imports: [TracksModule] })
  .overrideProvider(TracksService).useValue(mockDeep<TracksService>())
  .overrideGuard(UserAuthGuard).useValue({ canActivate: () => true })
  .compile()
```

`overrideGuard` is the seam that keeps auth out of every other test. Full patterns live in
the `jest` skill.

## Config and env

Access env through the validated config (`apps/api/env.schema.ts` + `@nestjs/config`), never
raw `process.env` inside a module. The schema is what makes a missing variable fail at
startup instead of at 3am. Never read or write `.env*`.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@nestjs/core` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@nestjs/core/package.json').version"
   ```
2. **Then the official docs:** https://docs.nestjs.com — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because decorator behaviour and DI edge cases changed across major versions.

## Related

- `.claude/rules/api-rules.md` — module structure, Swagger decorators, thin controllers.
- `jest` skill — unit/integration/E2E patterns for this structure.
- `prisma-client-api` skill — queries inside services.
- `bullmq`, `socketio` skills — the queue and gateway surfaces.
