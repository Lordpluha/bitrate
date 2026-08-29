---
name: api-rules
description: NestJS API quick reference for apps/api — module anatomy, the decorators/ Swagger rule, nestjs-zod DTOs, Prisma injection, BullMQ queues, guards, and HttpException error handling. Use whenever writing or reviewing a controller, service, module, guard, DTO, or Swagger decorator under apps/api/, or whenever asked to add an endpoint, queue job, or auth guard to the API.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# API rules — NestJS

Quick reference for `apps/api/`. Read `project-conventions` first for the cross-cutting picture; this file goes one level deeper on the API specifically.

## Module anatomy

```
apps/api/src/modules/<name>/
  <name>.module.ts      @Module decorator
  <name>.controller.ts  HTTP endpoints — thin, delegates to service
  <name>.service.ts     Business logic
  <name>.guard.ts       Auth guard (if needed)
  decorators/           Swagger composite decorators — one file per operation
  dtos/                 Input DTOs with Zod schemas (nestjs-zod)
  entities/             Domain entity classes (@ApiProperty annotated)
  errors/               Custom HttpException subclasses
  __tests__/            Fixtures and builders
  index.ts              Public barrel
```

**CRITICAL:** Never put `@ApiOperation`, `@ApiResponse`, `@ApiBody` inline in controller methods — always extract to `decorators/`. This is the single most-checked rule in review; get it right the first time.

## Controllers — thin by design

Controllers parse input and call services. Zero business logic, zero Prisma, zero direct DB access.

```ts
@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @TracksGetAllSwagger()
  @Get('')
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tracksService.findAll({ page, limit })
  }
}
```

## Swagger decorator pattern

```ts
// decorators/get-track-by-id.swagger.ts
import { ApiOperation, ApiParam, ApiResponse, applyDecorators } from '@nestjs/swagger'
import { TrackEntity } from '../entities'

export const GetTrackByIdSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get track by ID' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: 200, type: TrackEntity }),
    ApiResponse({ status: 404, description: 'Track not found' }),
  )

// in controller:
@GetTrackByIdSwagger()
@Get(':id')
getById(@Param('id', ParseUUIDPipe) id: string) {
  return this.tracksService.findById(id)
}
```

Re-export all decorators from `decorators/index.ts`.

## DTOs with nestjs-zod

```ts
// dtos/create-track.dto.ts
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateTrackSchema = z.object({
  title: z.string().min(1).max(255),
  duration: z.number().int().positive(),
  artistId: z.string().uuid(),
})

export class CreateTrackDto extends createZodDto(CreateTrackSchema) {}
```

`CreateTrackDto` types the controller's `@Body()`. Apply `new ZodValidationPipe(CreateTrackSchema)` at handler level or via the global pipe in `main.ts`.

## Entities (Swagger + return types)

```ts
// entities/track.entity.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiPropertyOptional()
  coverUrl?: string | null
}
```

Entity classes are not Prisma models — they describe the API response shape for Swagger and can be used as return type hints.

## Services

`@Injectable()` classes. Constructor injection only — never `new Service()`. Split into multiple focused services when a module grows large.

## Prisma

Inject `PrismaService` from `@infra/prisma/prisma.service`. Use inside services only — never in controllers.

```ts
async findById(id: string) {
  const track = await this.prisma.track.findFirst({ where: { id } })
  if (!track) throw new TrackNotFoundException(id)
  return track
}

// Pagination
async findAll({ page, limit }: PaginationInput) {
  const [data, total] = await Promise.all([
    this.prisma.track.findMany({ skip: (page - 1) * limit, take: limit }),
    this.prisma.track.count(),
  ])
  return { data, total, page, limit }
}
```

## BullMQ

Jobs live **in the module that owns them**, not in a shared queue folder:
`apps/api/src/modules/tracks/audio-processing.consumer.ts` is the reference. A consumer
(`@Processor`) sits beside the service that enqueues to it, and the queue is registered with
`BullModule.registerQueue(...)` in that module (`tracks.module.ts`), with the Redis
connection configured once in `app.module.ts`. See the `bullmq` skill for the full pattern.

## Guards

```ts
// users-auth.guard.ts
@Injectable()
export class UserAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<UserAuthRequest>()
    return !!req.user
  }
}
```

Apply on the controller class or individual routes. Common pattern: wrap in a decorator
(`@UserAuth()` wrapping `@UseGuards(UserAuthGuard)`).

## Errors

Throw NestJS built-ins (`NotFoundException`, `UnauthorizedException`, `ConflictException`, `BadRequestException`) or a custom `HttpException` subclass in `errors/`. Let the global filter handle serialisation — never return a manual `{ error: ... }` object.

```ts
export class TrackNotFoundException extends NotFoundException {
  constructor(id: string) { super(`Track ${id} not found`) }
}
```

## Path aliases (apps/api)

- `@modules/*` → `src/modules/*`
- `@infra/*` → `src/infra/*`
- `@common/*` → `src/common/*`
- `@test/*` → `test/*`

Cross-module imports go through the module's `index.ts` barrel.

## Module registration

Register new modules in `AppModule` (or a parent domain module). Modules are self-contained
— declare their own providers and export only what other modules need.

## Related rules and skills

- `jest` skill — unit/integration/E2E test patterns for this same module structure.
- `project-conventions` — the cross-cutting rules this file specializes.
